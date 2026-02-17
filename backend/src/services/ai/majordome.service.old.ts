import OpenAI from 'openai';
import { env } from '../../config/env';
import { prisma } from '../../config/database';
import { tools, executeTool } from './tools';

const client = new OpenAI({
  apiKey: env.AI_API_KEY,
  baseURL: env.AI_BASE_URL,
});
console.log('🔑 AI Config:', { baseURL: env.AI_BASE_URL, model: env.AI_MODEL, keyStart: env.AI_API_KEY.substring(0, 10) + '...' });

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

export async function chat(
  message: string,
  conversationId: string | null,
  userId: string | null
): Promise<{ reply: string; conversationId: string }> {

  // 1. Charger ou créer la conversation
  let conversation: any;
  let messages: any[] = [];

  if (conversationId) {
    conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (conversation) {
      messages = conversation.messages as any[];
    }
  }
if (!conversation) {
    // Si pas de userId, créer un guest temporaire
    let finalUserId = userId;
    if (!finalUserId) {
      const guestUser = await prisma.user.create({
        data: {
          email: `guest-${Date.now()}@temp.marrakech-access.com`,
          passwordHash: 'no-auth',
          firstName: 'Visiteur',
          lastName: 'Anonyme',
          role: 'GUEST',
        },
      });
      finalUserId = guestUser.id;
    }

    conversation = await prisma.conversation.create({
      data: {
        userId: finalUserId,
        context: {},
        messages: [],
      },
    });
  }
 
  // 2. Charger le user si connecté
  let user = null;
  if (userId && userId !== 'anonymous') {
    user = await prisma.user.findUnique({ where: { id: userId } });
  }

  // 3. Ajouter le message user
  messages.push({ role: 'user', content: message });

  // 4. Appel IA avec tools
  let response = await client.chat.completions.create({
    model: env.AI_MODEL,
    temperature: 0.4,
    max_tokens: 1024,
    messages: [
      { role: 'system', content: buildSystemPrompt(user) },
      ...messages.slice(-20), // Garder les 20 derniers messages pour le contexte
    ],
    tools,
    tool_choice: 'auto',
  });

  let assistantMessage = response.choices[0].message;

  // 5. Boucle tool calling (le Majordome peut enchaîner plusieurs outils)
  let loopCount = 0;
  while (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0 && loopCount < 5) {
    loopCount++;

    // Ajouter la réponse de l'assistant avec les tool_calls
    messages.push({
      role: 'assistant',
      content: assistantMessage.content || '',
      tool_calls: assistantMessage.tool_calls,
    });

    // Exécuter chaque tool call
    for (const toolCall of assistantMessage.tool_calls) {
      if (toolCall.type !== 'function') continue;
      
      const args = JSON.parse(toolCall.function.arguments);
      console.log(`🔧 Tool: ${toolCall.function.name}`, args);

      const result = await executeTool(toolCall.function.name, args, userId);
      console.log(`✅ Résultat:`, JSON.stringify(result).substring(0, 200));

      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }

    // Relancer l'IA avec les résultats des tools
    response = await client.chat.completions.create({
      model: env.AI_MODEL,
      temperature: 0.4,
      max_tokens: 1024,
      messages: [
        { role: 'system', content: buildSystemPrompt(user) },
        ...messages.slice(-20),
      ],
      tools,
      tool_choice: 'auto',
    });

    assistantMessage = response.choices[0].message;
  }

  // 6. Extraire la réponse texte
  const reply = assistantMessage.content || "Je suis désolé, je n'ai pas pu traiter votre demande. Pouvez-vous reformuler ?";

  // 7. Sauvegarder
  messages.push({ role: 'assistant', content: reply });

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      messages: messages as any,
      updatedAt: new Date(),
    },
  });

  return {
    reply,
    conversationId: conversation.id,
  };
}