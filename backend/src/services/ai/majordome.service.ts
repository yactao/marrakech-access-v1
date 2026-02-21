import OpenAI from 'openai';
import { env } from '../../config/env';
import { prisma } from '../../config/database';
import { tools, executeTool } from './tools';

const client = new OpenAI({
  apiKey: env.AI_API_KEY,
  baseURL: env.AI_BASE_URL,
});

console.log('🔑 AI Config:', {
  baseURL: env.AI_BASE_URL,
  model: env.AI_MODEL,
  keyStart: env.AI_API_KEY.substring(0, 10) + '...',
});

function buildSystemPrompt(user: any): string {
  return `Tu es le Majordome de Marrakech Access, un concierge de luxe IA pour une plateforme de location haut de gamme à Marrakech.

## TA PERSONNALITÉ
- Ton : chaleureux, élégant, professionnel. Comme un maître d'hôtel 5 étoiles.
- Tu tutoies si le client tutoie, sinon vouvoiement par défaut.
- Tu es expert de Marrakech : quartiers, culture, bons plans, saisonnalité.
- Tu es proactif : tu proposes des options, tu ne te contentes pas de répondre.
- Tu réponds en français par défaut, en anglais si le client parle anglais.

## TON RÔLE
Tu aides les voyageurs à :
1. Trouver le bien idéal (villa, riad, appartement) selon leurs critères
2. Vérifier la disponibilité et les prix pour des dates précises
3. Créer des réservations directement depuis le chat (quand le client confirme)
4. Découvrir et réserver des expériences (chef à domicile, quad, montgolfière, hammam...)
5. Répondre à toutes les questions sur Marrakech (quartiers, restaurants, transport, météo...)
6. Gérer les réclamations et demandes spéciales pendant le séjour (créer des tickets)
7. Consulter le statut des réservations existantes

## RÈGLES ABSOLUES
1. N'invente JAMAIS de biens, de prix ou de disponibilités — utilise TOUJOURS les outils (functions)
2. Si tu ne sais pas → dis-le et propose de chercher
3. Ne montre jamais de JSON brut — reformule en langage naturel et élégant
4. Quand tu présentes des biens, inclus le lien : "Vous pouvez le voir ici : /properties/[slug]"
5. AVANT de créer une réservation, vérifie TOUJOURS la disponibilité avec check_availability et DEMANDE confirmation au client
6. Pour les réclamations urgentes, crée un ticket avec priorité URGENT
7. Propose toujours une suite : "Souhaitez-vous que je vérifie les disponibilités ?" ou "Puis-je ajouter des extras ?"
8. Sois concis mais complet. Pas de pavés inutiles.
9. N'utilise JAMAIS de termes techniques comme "slug", "ID", "API", "base de données". Tu es un majordome, pas un développeur. Si tu dois identifier un bien, utilise son nom et cherche-le toi-même avec les outils.
10. Quand un client mentionne un bien par son nom (même approximatif), utilise search_properties pour le retrouver automatiquement. Ne demande JAMAIS au client de fournir un identifiant technique.

## CONTEXTE UTILISATEUR
${user ? `Prénom: ${user.firstName}, Rôle: ${user.role}` : 'Visiteur non connecté'}
Date du jour: ${new Date().toLocaleDateString('fr-FR')}`;
}

// Conversations anonymes en mémoire (pas en DB)
// Limite : MAX_ANON_CONVERSATIONS conversations simultanées max
const MAX_ANON_CONVERSATIONS = 500;
const MAX_ANON_MESSAGES = 20;       // max échanges par conversation anonyme
const MAX_ANON_MESSAGE_LENGTH = 800; // max caractères par message anonyme

const anonymousConversations = new Map<string, any[]>();
// Timestamp de DERNIÈRE ACTIVITÉ par conversation (pour nettoyage correct)
const anonLastActivity = new Map<string, number>();

// Nettoyage automatique des conversations inactives depuis plus de 2h
setInterval(() => {
  const TWO_HOURS = 2 * 60 * 60 * 1000;
  const cutoff = Date.now() - TWO_HOURS;
  for (const [id, lastActivity] of anonLastActivity.entries()) {
    if (lastActivity < cutoff) {
      anonymousConversations.delete(id);
      anonLastActivity.delete(id);
    }
  }
}, 30 * 60 * 1000); // toutes les 30 minutes

export async function chat(
  message: string,
  conversationId: string | null,
  userId: string | null
): Promise<{ reply: string; conversationId: string }> {

  // ──────────────────────────────────────────────────────
  // CAS A : Visiteur non connecté → conversation en mémoire
  // Aucune écriture en base, pas de user fantôme.
  // ──────────────────────────────────────────────────────
  if (!userId) {
    // Tronquer le message si trop long
    const safeMessage = message.slice(0, MAX_ANON_MESSAGE_LENGTH);

    // Générer un ID de conversation anonyme si premier message
    const anonId = conversationId || `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Si la Map est pleine, supprimer la conversation la plus ancienne
    if (!anonymousConversations.has(anonId) && anonymousConversations.size >= MAX_ANON_CONVERSATIONS) {
      const oldestId = anonLastActivity.keys().next().value;
      if (oldestId) {
        anonymousConversations.delete(oldestId);
        anonLastActivity.delete(oldestId);
      }
    }

    // Charger ou initialiser l'historique en mémoire
    const conversationMessages = anonymousConversations.get(anonId) || [];

    // Bloquer si la conversation a atteint la limite de messages
    if (conversationMessages.length >= MAX_ANON_MESSAGES * 2) {
      return {
        reply: 'Cette conversation a atteint sa limite. Connectez-vous pour continuer.',
        conversationId: anonId,
      };
    }

    // Ajouter le message utilisateur
    conversationMessages.push({ role: 'user', content: safeMessage });

    // Appel IA
    const reply = await runAIWithTools(conversationMessages, null);

    // Sauvegarder en mémoire et mettre à jour le timestamp d'activité
    conversationMessages.push({ role: 'assistant', content: reply });
    anonymousConversations.set(anonId, conversationMessages);
    anonLastActivity.set(anonId, Date.now());

    return { reply, conversationId: anonId };
  }

  // ──────────────────────────────────────────────────────
  // CAS B : Utilisateur connecté → conversation en base MySQL
  // ──────────────────────────────────────────────────────
  let conversation: any;
  let messages: any[] = [];

  // Charger la conversation existante
  if (conversationId && !conversationId.startsWith('anon-')) {
    conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (conversation) {
      messages = conversation.messages as any[];
    }
  }

  // Créer une nouvelle conversation si besoin
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        userId,
        context: {},
        messages: [],
      },
    });
  }

  // Charger les infos utilisateur pour le prompt
  const user = await prisma.user.findUnique({ where: { id: userId } });

  // Ajouter le message utilisateur
  messages.push({ role: 'user', content: message });

  // Appel IA avec les tools
  const reply = await runAIWithTools(messages, userId, user);

  // Sauvegarder en base
  messages.push({ role: 'assistant', content: reply });

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      messages: messages as any,
      updatedAt: new Date(),
    },
  });

  return { reply, conversationId: conversation.id };
}

// ──────────────────────────────────────────────────────
// Fonction interne : boucle tool calling DeepSeek
// Extraite pour être réutilisée par les deux cas (connecté / anonyme)
// ──────────────────────────────────────────────────────
async function runAIWithTools(
  messages: any[],
  userId: string | null,
  user?: any
): Promise<string> {
  let response = await client.chat.completions.create({
    model: env.AI_MODEL,
    temperature: 0.4,
    max_tokens: 1024,
    messages: [
      { role: 'system', content: buildSystemPrompt(user || null) },
      ...messages.slice(-20),
    ],
    tools,
    tool_choice: 'auto',
  });

  let assistantMessage = response.choices[0].message;

  // Boucle tool calling (max 5 itérations)
  let loopCount = 0;
  while (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0 && loopCount < 5) {
    loopCount++;

    messages.push({
      role: 'assistant',
      content: assistantMessage.content || '',
      tool_calls: assistantMessage.tool_calls,
    });

    for (const toolCall of assistantMessage.tool_calls) {
      if (toolCall.type !== 'function') continue;

      // ✅ FIX bonus — try/catch sur JSON.parse pour éviter crash si DeepSeek renvoie JSON malformé
      let args: any = {};
      try {
        args = JSON.parse(toolCall.function.arguments);
      } catch (e) {
        console.error(`❌ JSON.parse échoué pour tool ${toolCall.function.name}:`, toolCall.function.arguments);
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify({ error: 'Arguments invalides reçus de l\'IA.' }),
        });
        continue;
      }

      console.log(`🔧 Tool: ${toolCall.function.name}`, args);
      const result = await executeTool(toolCall.function.name, args, userId);
      console.log(`✅ Résultat:`, JSON.stringify(result).substring(0, 200));

      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }

    response = await client.chat.completions.create({
      model: env.AI_MODEL,
      temperature: 0.4,
      max_tokens: 1024,
      messages: [
        { role: 'system', content: buildSystemPrompt(user || null) },
        ...messages.slice(-20),
      ],
      tools,
      tool_choice: 'auto',
    });

    assistantMessage = response.choices[0].message;
  }

  return (
    assistantMessage.content ||
    "Je suis désolé, je n'ai pas pu traiter votre demande. Pouvez-vous reformuler ?"
  );
}