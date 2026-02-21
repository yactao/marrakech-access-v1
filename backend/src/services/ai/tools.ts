import { prisma } from '../../config/database';
import type { ChatCompletionTool } from 'openai/resources/chat/completions';

// =============================================
// DÉFINITION DES TOOLS (Functions)
// =============================================

export const tools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_properties',
      description: 'Cherche des biens disponibles à Marrakech selon les critères du client (quartier, type, budget, capacité)',
      parameters: {
        type: 'object',
        properties: {
          district: { type: 'string', description: 'Quartier : Palmeraie, Médina, Guéliz, Hivernage, Amelkis, Mellah' },
          type: { type: 'string', enum: ['VILLA', 'RIAD', 'APPARTEMENT', 'DAR', 'SUITE'], description: 'Type de bien' },
          min_capacity: { type: 'number', description: 'Nombre minimum de voyageurs' },
          max_budget: { type: 'number', description: 'Budget maximum par nuit en MAD' },
          bedrooms: { type: 'number', description: 'Nombre minimum de chambres' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_property_details',
      description: 'Obtient les détails complets d\'un bien spécifique (description, équipements, prix, avis)',
      parameters: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Le slug (identifiant URL) du bien' },
        },
        required: ['slug'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_extras',
      description: 'Cherche les expériences et services disponibles (culinaire, bien-être, excursions, transport, loisirs)',
      parameters: {
        type: 'object',
        properties: {
          category: { type: 'string', enum: ['culinaire', 'bien-etre', 'excursion', 'transport', 'loisir'], description: 'Catégorie de service' },
          max_budget: { type: 'number', description: 'Budget maximum en MAD' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_knowledge',
      description: 'Cherche dans la base de connaissances sur Marrakech (quartiers, restaurants, activités, infos pratiques, FAQ)',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'La question ou le sujet recherché' },
          category: { type: 'string', enum: ['quartier', 'restaurant', 'activite', 'pratique', 'faq'], description: 'Catégorie de recherche' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_availability',
      description: 'Vérifie la disponibilité d\'un bien pour des dates précises et calcule le prix total',
      parameters: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Le slug du bien' },
          check_in: { type: 'string', description: 'Date d\'arrivée au format YYYY-MM-DD' },
          check_out: { type: 'string', description: 'Date de départ au format YYYY-MM-DD' },
          guests: { type: 'number', description: 'Nombre de voyageurs' },
        },
        required: ['slug', 'check_in', 'check_out', 'guests'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_booking',
      description: 'Crée une réservation pour un client connecté. Utilise cet outil uniquement quand le client confirme explicitement vouloir réserver avec des dates et un bien précis.',
      parameters: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Le slug du bien à réserver' },
          check_in: { type: 'string', description: 'Date d\'arrivée au format YYYY-MM-DD' },
          check_out: { type: 'string', description: 'Date de départ au format YYYY-MM-DD' },
          guests: { type: 'number', description: 'Nombre de voyageurs' },
          extras: {
            type: 'array',
            description: 'Liste des extras à ajouter à la réservation',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Nom exact de l\'extra' },
                quantity: { type: 'number', description: 'Quantité' },
              },
            },
          },
          special_requests: { type: 'string', description: 'Demandes spéciales du client' },
        },
        required: ['slug', 'check_in', 'check_out', 'guests'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_ticket',
      description: 'Crée un ticket de réclamation ou de demande spéciale pour l\'équipe. Utilise cet outil quand le client signale un problème, une réclamation, ou a une demande qui nécessite l\'intervention de l\'équipe humaine.',
      parameters: {
        type: 'object',
        properties: {
          subject: { type: 'string', description: 'Sujet court du ticket' },
          type: { type: 'string', enum: ['reclamation', 'demande_speciale', 'urgence', 'information', 'autre'], description: 'Type de ticket' },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], description: 'Priorité du ticket' },
          message: { type: 'string', description: 'Description détaillée du problème ou de la demande' },
        },
        required: ['subject', 'type', 'priority', 'message'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_booking_status',
      description: 'Récupère le statut et les détails des réservations d\'un client connecté',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  // =============================================
  // NOUVEAUX TOOLS - KNOWLEDGE BASE MARRAKECH
  // =============================================
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Obtient la météo actuelle et les prévisions à Marrakech. Utilise cet outil quand le client demande le temps qu\'il fait, s\'il doit prendre une veste, ou pour conseiller sur les activités selon la météo.',
      parameters: {
        type: 'object',
        properties: {
          days: { 
            type: 'number', 
            description: 'Nombre de jours de prévision (1-7, défaut: 3)',
            default: 3
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_events',
      description: 'Liste les événements, festivals et activités spéciales à Marrakech pour une période donnée. Utilise cet outil quand le client demande "que faire", "événements", "festivals", ou planifie son séjour.',
      parameters: {
        type: 'object',
        properties: {
          start_date: { 
            type: 'string', 
            description: 'Date de début au format YYYY-MM-DD (défaut: aujourd\'hui)' 
          },
          end_date: { 
            type: 'string', 
            description: 'Date de fin au format YYYY-MM-DD (défaut: +7 jours)' 
          },
          category: { 
            type: 'string', 
            enum: ['culture', 'musique', 'sport', 'gastronomie', 'tradition', 'all'],
            description: 'Catégorie d\'événement (défaut: all)' 
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_city_tips',
      description: 'Donne des conseils pratiques et culturels sur Marrakech : quartiers, transport, pourboires, négociation, sécurité, dress code, etc. Utilise cet outil pour tout conseil de "local" ou question pratique sur la ville.',
      parameters: {
        type: 'object',
        properties: {
          topic: { 
            type: 'string', 
            enum: ['quartiers', 'transport', 'argent', 'culture', 'securite', 'shopping', 'restaurants', 'vie_nocturne', 'excursions', 'general'],
            description: 'Sujet du conseil' 
          },
          district: { 
            type: 'string', 
            description: 'Quartier spécifique (optionnel): Médina, Guéliz, Hivernage, Palmeraie, Mellah, Amelkis' 
          },
        },
        required: ['topic'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_to_cart',
      description: 'Prépare les données pour ajouter un bien ou un extra au panier du client. Utilise cet outil quand le client dit vouloir réserver un bien ou ajouter un extra sans confirmer immédiatement la réservation. Retourne les infos nécessaires pour que le frontend mette à jour le panier.',
      parameters: {
        type: 'object',
        properties: {
          type: { 
            type: 'string', 
            enum: ['property', 'extra'],
            description: 'Type d\'élément à ajouter : property pour un hébergement, extra pour une expérience' 
          },
          slug: { 
            type: 'string', 
            description: 'Slug du bien (requis si type=property)' 
          },
          extra_name: { 
            type: 'string', 
            description: 'Nom de l\'extra (requis si type=extra)' 
          },
          check_in: { 
            type: 'string', 
            description: 'Date d\'arrivée au format YYYY-MM-DD (pour property)' 
          },
          check_out: { 
            type: 'string', 
            description: 'Date de départ au format YYYY-MM-DD (pour property)' 
          },
          guests: { 
            type: 'number', 
            description: 'Nombre de voyageurs (pour property)' 
          },
          quantity: { 
            type: 'number', 
            description: 'Quantité (pour extra, défaut: 1)' 
          },
        },
        required: ['type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_recommendations',
      description: 'Génère des recommandations personnalisées basées sur le profil du client, ses préférences ou le contexte de sa demande. Utilise cet outil pour suggérer des biens, extras ou activités adaptés.',
      parameters: {
        type: 'object',
        properties: {
          context: {
            type: 'string',
            description: 'Contexte ou type de séjour : romantique, famille, groupe_amis, affaires, luxe, budget, aventure, detente'
          },
          budget_per_night: {
            type: 'number',
            description: 'Budget maximum par nuit en MAD'
          },
          guests: {
            type: 'number',
            description: 'Nombre de voyageurs'
          },
          interests: {
            type: 'array',
            items: { type: 'string' },
            description: 'Centres d\'intérêt : culture, gastronomie, sport, bien-etre, shopping, nature, fete'
          },
        },
        required: ['context'],
      },
    },
  },
  // =============================================
  // TOOLS VENTES — suggestions et alternatives
  // =============================================
  {
    type: 'function',
    function: {
      name: 'get_similar_properties',
      description: 'Cherche des biens similaires disponibles quand un bien est indisponible, trop cher ou ne correspond plus. Utilise cet outil pour ne jamais laisser un client sans alternative.',
      parameters: {
        type: 'object',
        properties: {
          excluded_slug: { type: 'string', description: 'Slug du bien à exclure des résultats' },
          capacity: { type: 'number', description: 'Nombre minimum de voyageurs requis' },
          type: { type: 'string', enum: ['VILLA', 'RIAD', 'APPARTEMENT', 'DAR', 'SUITE'], description: 'Type de bien préféré (optionnel)' },
          district: { type: 'string', description: 'Quartier préféré (optionnel)' },
          max_budget: { type: 'number', description: 'Budget maximum par nuit en MAD (optionnel)' },
          check_in: { type: 'string', description: 'Date arrivée YYYY-MM-DD pour vérifier la dispo (optionnel)' },
          check_out: { type: 'string', description: 'Date départ YYYY-MM-DD pour vérifier la dispo (optionnel)' },
        },
        required: ['excluded_slug', 'capacity'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_upsell_suggestions',
      description: 'Suggère des extras pertinents et complémentaires après qu\'un client a choisi ou consulté un bien. Utilise cet outil pour enrichir le séjour et augmenter la valeur de la réservation.',
      parameters: {
        type: 'object',
        properties: {
          property_slug: { type: 'string', description: 'Slug du bien sélectionné' },
          context: { type: 'string', description: 'Type de séjour : romantique, famille, groupe_amis, affaires, luxe, aventure, detente' },
          guests: { type: 'number', description: 'Nombre de voyageurs' },
        },
        required: ['property_slug'],
      },
    },
  },
  // =============================================
  // TOOLS ADMIN — gestion et statistiques
  // =============================================
  {
    type: 'function',
    function: {
      name: 'get_admin_dashboard',
      description: 'Affiche les statistiques temps réel de la plateforme : réservations du jour, CA du mois, tickets urgents, arrivées/départs. Utilise cet outil quand l\'admin demande un résumé de l\'activité.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_pending_items',
      description: 'Liste les éléments en attente d\'action : réservations PENDING à confirmer, tickets OPEN/IN_PROGRESS à traiter. Utilise cet outil pour aider l\'admin à prioriser ses tâches.',
      parameters: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['bookings', 'tickets', 'all'], description: 'Type d\'éléments à lister (défaut: all)' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_booking_status',
      description: 'Confirme ou annule une réservation. Demande TOUJOURS confirmation à l\'admin avant d\'exécuter. Utilise cet outil uniquement quand l\'admin confirme explicitement vouloir changer le statut.',
      parameters: {
        type: 'object',
        properties: {
          booking_id: { type: 'string', description: 'ID de la réservation' },
          status: { type: 'string', enum: ['CONFIRMED', 'CANCELLED'], description: 'Nouveau statut' },
          reason: { type: 'string', description: 'Raison du changement (optionnel)' },
        },
        required: ['booking_id', 'status'],
      },
    },
  },
];

// =============================================
// FILTRAGE DES TOOLS PAR RÔLE
// =============================================

// Noms des tools réservés à l'admin
const ADMIN_TOOL_NAMES = new Set(['get_admin_dashboard', 'get_pending_items', 'update_booking_status']);
// Noms des tools réservés aux guests/ventes (pas utiles pour l'admin)
const GUEST_TOOL_NAMES = new Set(['get_upsell_suggestions', 'get_similar_properties', 'create_booking', 'create_ticket', 'get_booking_status', 'add_to_cart', 'get_recommendations']);

export function getToolsForRole(role: string | null): ChatCompletionTool[] {
  const getName = (t: ChatCompletionTool): string =>
    t.type === 'function' ? (t as { type: 'function'; function: { name: string } }).function.name : '';

  if (role === 'ADMIN') {
    return tools.filter(t => !GUEST_TOOL_NAMES.has(getName(t)));
  }
  return tools.filter(t => !ADMIN_TOOL_NAMES.has(getName(t)));
}

// =============================================
// EXÉCUTION DES TOOLS
// =============================================

export async function executeTool(name: string, args: any, userId?: string | null): Promise<any> {
  switch (name) {
    case 'search_properties':
      return searchProperties(args);
    case 'get_property_details':
      return getPropertyDetails(args);
    case 'search_extras':
      return searchExtras(args);
    case 'search_knowledge':
      return searchKnowledge(args);
    case 'check_availability':
      return checkAvailability(args);
    case 'create_booking':
      return createBooking(args, userId);
    case 'create_ticket':
      return createTicket(args, userId);
    case 'get_booking_status':
      return getBookingStatus(userId);
    case 'get_weather':
      return getWeather(args);
    case 'get_events':
      return getEvents(args);
    case 'get_city_tips':
      return getCityTips(args);
    case 'add_to_cart':
      return addToCart(args);
    case 'get_recommendations':
      return getRecommendations(args);
    // Tools ventes
    case 'get_similar_properties':
      return getSimilarProperties(args);
    case 'get_upsell_suggestions':
      return getUpsellSuggestions(args);
    // Tools admin
    case 'get_admin_dashboard':
      return getAdminDashboard();
    case 'get_pending_items':
      return getPendingItems(args);
    case 'update_booking_status':
      return updateBookingStatus(args);
    default:
      return { error: `Outil inconnu : ${name}` };
  }
}

// --- SEARCH PROPERTIES ---
async function searchProperties(args: {
  district?: string; type?: string; min_capacity?: number; max_budget?: number; bedrooms?: number;
}) {
  const where: any = { status: 'ACTIVE' };
  if (args.district) where.district = args.district;
  if (args.type) where.type = args.type;
  if (args.min_capacity) where.capacity = { gte: args.min_capacity };
  if (args.max_budget) where.priceLowSeason = { lte: args.max_budget };
  if (args.bedrooms) where.bedrooms = { gte: args.bedrooms };

  const properties = await prisma.property.findMany({
    where,
    select: {
      name: true, slug: true, type: true, district: true,
      bedrooms: true, bathrooms: true, capacity: true, surface: true,
      priceLowSeason: true, priceHighSeason: true, shortDesc: true, amenities: true, minNights: true,
    },
    orderBy: { priceLowSeason: 'asc' },
    take: 5,
  });

  if (properties.length === 0) {
    return { message: 'Aucun bien ne correspond à ces critères.', count: 0, properties: [] };
  }

  return {
    count: properties.length,
    properties: properties.map((p) => ({
      nom: p.name, slug: p.slug, type: p.type, quartier: p.district,
      chambres: p.bedrooms, capacite: p.capacity, surface: `${p.surface}m²`,
      prix_basse_saison: `${p.priceLowSeason} MAD/nuit`,
      prix_haute_saison: `${p.priceHighSeason} MAD/nuit`,
      description: p.shortDesc, nuits_minimum: p.minNights,
      lien: `/properties/${p.slug}`,
    })),
  };
}

// --- GET PROPERTY DETAILS ---
async function getPropertyDetails(args: { slug: string }) {
  const property = await prisma.property.findUnique({
    where: { slug: args.slug },
    include: { reviews: { select: { rating: true, comment: true }, take: 3, orderBy: { createdAt: 'desc' } } },
  });

  if (!property) return { error: 'Bien non trouvé' };

  const avgRating = property.reviews.length > 0
    ? (property.reviews.reduce((a, b) => a + b.rating, 0) / property.reviews.length).toFixed(1)
    : 'Pas encore noté';

  return {
    nom: property.name, slug: property.slug, type: property.type, quartier: property.district,
    adresse: property.address, description: property.description,
    chambres: property.bedrooms, salles_de_bain: property.bathrooms,
    capacite: property.capacity, surface: `${property.surface}m²`,
    equipements: property.amenities,
    prix_basse_saison: `${property.priceLowSeason} MAD/nuit`,
    prix_haute_saison: `${property.priceHighSeason} MAD/nuit`,
    frais_menage: `${property.cleaningFee} MAD`,
    nuits_minimum: property.minNights, note_moyenne: avgRating,
    lien: `/properties/${property.slug}`,
  };
}

// --- SEARCH EXTRAS ---
async function searchExtras(args: { category?: string; max_budget?: number }) {
  const where: any = { available: true };
  if (args.category) where.category = args.category;
  if (args.max_budget) where.price = { lte: args.max_budget };

  const extras = await prisma.extra.findMany({
    where,
    select: { id: true, name: true, category: true, description: true, price: true, priceUnit: true, duration: true, maxPersons: true },
    orderBy: { sortOrder: 'asc' },
  });

  if (extras.length === 0) return { message: 'Aucune expérience trouvée.', count: 0, extras: [] };

  return {
    count: extras.length,
    extras: extras.map((e) => ({
      id: e.id, nom: e.name, categorie: e.category, description: e.description,
      prix: `${e.price} MAD/${e.priceUnit}`, duree: e.duration, max_personnes: e.maxPersons,
    })),
  };
}

// --- SEARCH KNOWLEDGE ---
async function searchKnowledge(args: { query: string; category?: string }) {
  const where: any = {};
  if (args.category) where.category = args.category;

  const results = await prisma.knowledgeBase.findMany({
    where: {
      ...where,
      OR: [
        { title: { contains: args.query } },
        { content: { contains: args.query } },
      ],
    },
    select: { title: true, content: true, category: true },
    take: 3,
  });

  if (results.length === 0) {
    const fallback = await prisma.knowledgeBase.findMany({
      where: args.category ? { category: args.category } : {},
      select: { title: true, content: true, category: true },
      take: 3,
    });
    return { results: fallback };
  }
  return { results };
}

// --- CHECK AVAILABILITY ---
async function checkAvailability(args: { slug: string; check_in: string; check_out: string; guests: number }) {
  const property = await prisma.property.findUnique({ where: { slug: args.slug } });
  if (!property) return { error: 'Bien non trouvé' };
  if (property.status !== 'ACTIVE') return { error: 'Ce bien n\'est pas disponible actuellement' };

  const checkIn = new Date(args.check_in);
  const checkOut = new Date(args.check_out);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  if (nights <= 0) return { error: 'Les dates sont invalides' };
  if (nights < property.minNights) return { error: `Séjour minimum de ${property.minNights} nuit(s) requis` };
  if (args.guests > property.capacity) return { error: `Capacité maximum : ${property.capacity} voyageurs` };

  const overlapping = await prisma.booking.findFirst({
    where: {
      propertyId: property.id,
      status: { in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'] },
      OR: [{ checkIn: { lt: checkOut }, checkOut: { gt: checkIn } }],
    },
  });

  if (overlapping) {
    return {
      disponible: false,
      message: `Désolé, "${property.name}" est déjà réservé pour ces dates.`,
      suggestion: 'Je peux chercher d\'autres biens similaires disponibles si vous le souhaitez.',
    };
  }

  const month = checkIn.getMonth() + 1;
  const isHighSeason = [3, 4, 5, 10, 11, 12].includes(month);
  const pricePerNight = isHighSeason ? Number(property.priceHighSeason) : Number(property.priceLowSeason);
  const accommodationTotal = pricePerNight * nights;
  const cleaningFee = Number(property.cleaningFee);
  const total = accommodationTotal + cleaningFee;

  return {
    disponible: true,
    bien: property.name,
    slug: property.slug,
    dates: { arrivee: args.check_in, depart: args.check_out },
    nuits: nights,
    voyageurs: args.guests,
    saison: isHighSeason ? 'haute' : 'basse',
    prix_par_nuit: `${pricePerNight} MAD`,
    hebergement: `${accommodationTotal} MAD`,
    frais_menage: `${cleaningFee} MAD`,
    total: `${total} MAD`,
    lien_reservation: `/properties/${property.slug}`,
    message: `"${property.name}" est disponible ! ${nights} nuit(s) du ${args.check_in} au ${args.check_out} pour ${total} MAD au total.`,
  };
}

// --- CREATE BOOKING ---
async function createBooking(args: {
  slug: string; check_in: string; check_out: string; guests: number;
  extras?: { name: string; quantity: number }[];
  special_requests?: string;
}, userId?: string | null) {
  if (!userId || userId === 'anonymous') {
    return {
      error: 'Vous devez être connecté pour réserver.',
      action: 'Connectez-vous ou créez un compte sur la page /login, puis revenez me voir !',
    };
  }

  const property = await prisma.property.findUnique({ where: { slug: args.slug } });
  if (!property) return { error: 'Bien non trouvé' };
  if (property.status !== 'ACTIVE') return { error: 'Ce bien n\'est pas disponible' };

  const checkIn = new Date(args.check_in);
  const checkOut = new Date(args.check_out);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  if (nights <= 0) return { error: 'Dates invalides' };
  if (nights < property.minNights) return { error: `Séjour minimum de ${property.minNights} nuit(s)` };
  if (args.guests > property.capacity) return { error: `Capacité max : ${property.capacity}` };

  // Vérif dispo
  const overlapping = await prisma.booking.findFirst({
    where: {
      propertyId: property.id,
      status: { in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'] },
      OR: [{ checkIn: { lt: checkOut }, checkOut: { gt: checkIn } }],
    },
  });
  if (overlapping) return { error: 'Ce bien est déjà réservé pour ces dates' };

  // Prix
  const month = checkIn.getMonth() + 1;
  const isHighSeason = [3, 4, 5, 10, 11, 12].includes(month);
  const pricePerNight = isHighSeason ? Number(property.priceHighSeason) : Number(property.priceLowSeason);
  const accommodationTotal = pricePerNight * nights;
  const cleaningFee = Number(property.cleaningFee);

  // Extras
  let extrasTotal = 0;
  // Utilisation de 'any[]' pour simplifier la construction de l'objet Prisma complexe
  const extrasToCreate: any[] = [];

  if (args.extras && args.extras.length > 0) {
    // On récupère tous les extras potentiels d'un coup pour éviter de faire N requêtes
    // (Note: la recherche par nom exact est risquée, 'contains' est mieux mais peut donner des faux positifs. 
    // Ici on garde votre logique 'contains' mais attention aux homonymes)
    for (const item of args.extras) {
        const extra = await prisma.extra.findFirst({
            where: { name: { contains: item.name }, available: true },
        });

        if (extra) {
            const unitPrice = Number(extra.price);
            const subtotalExtra = unitPrice * item.quantity;
            extrasTotal += subtotalExtra;

            extrasToCreate.push({
                extra: { connect: { id: extra.id } }, // Liaison correcte
                quantity: item.quantity,
                unitPrice: unitPrice,
                subtotal: subtotalExtra, // Champ requis par le schéma
                date: checkIn, // Date requise par le schéma (on met checkIn par défaut)
            });
        }
    }
  }

  const totalAmount = accommodationTotal + cleaningFee + extrasTotal;

  // Créer la réservation
  try {
      const booking = await prisma.booking.create({
        data: {
          guestId: userId,
          propertyId: property.id,
          checkIn, 
          checkOut, 
          nights,
          guestsCount: args.guests,
          
          // Mapping financier correct selon le schéma
          pricePerNight, 
          subtotal: accommodationTotal, // Attention: schema field is 'subtotal', variable is 'accommodationTotal'
          cleaningFee, 
          extrasTotal, 
          totalAmount,
          
          status: 'PENDING',
          paymentStatus: 'PENDING',
          
          // Mapping texte correct selon le schéma
          guestMessage: args.special_requests || null, // Schema field is 'guestMessage'
          
          extras: {
            create: extrasToCreate,
          },
        },
      });

      return {
        succes: true,
        message: `Votre réservation pour "${property.name}" a été créée avec succès !`,
        reservation: {
          id: booking.id,
          bien: property.name,
          arrivee: args.check_in,
          depart: args.check_out,
          nuits: nights,
          voyageurs: args.guests,
          hebergement: `${accommodationTotal} MAD`,
          frais_menage: `${cleaningFee} MAD`,
          extras: `${extrasTotal} MAD`,
          total: `${totalAmount} MAD`,
          statut: 'En attente de confirmation',
        },
        prochaine_etape: 'Notre équipe va confirmer votre réservation sous 24h. Vous recevrez un email de confirmation.',
      };
  } catch (error) {
      console.error("Erreur création booking tool:", error);
      return { error: "Une erreur technique est survenue lors de la création de la réservation." };
  }
}

// --- CREATE TICKET ---
async function createTicket(args: {
  subject: string; type: string; priority: string; message: string;
}, userId?: string | null) {
  if (!userId || userId === 'anonymous') {
    return {
      error: 'Vous devez être connecté pour créer un ticket.',
      action: 'Connectez-vous sur /login puis revenez me signaler le problème.',
    };
  }

  // Trouver la réservation active du client (si elle existe)
  const activeBooking = await prisma.booking.findFirst({
    where: {
      guestId: userId,
      status: { in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'] },
    },
    orderBy: { checkIn: 'desc' },
  });

  const ticket = await prisma.ticket.create({
    data: {
      creatorId: userId,
      bookingId: activeBooking?.id || null,
      type: args.type,
      subject: args.subject,
      priority: args.priority as any,
      status: 'OPEN',
      messages: JSON.parse(JSON.stringify([{
        date: new Date().toISOString(),
        from: 'client',
        text: args.message,
        via: 'majordome_ia',
      }])),
    },
  });

  return {
    succes: true,
    message: `Votre ticket "${args.subject}" a été créé et transmis à notre équipe.`,
    ticket_id: ticket.id,
    priorite: args.priority,
    prochaine_etape: args.priority === 'URGENT'
      ? 'Étant donné l\'urgence, notre équipe va vous contacter dans l\'heure.'
      : 'Notre équipe va traiter votre demande dans les plus brefs délais (généralement sous 24h).',
  };
}

// --- GET BOOKING STATUS ---
async function getBookingStatus(userId?: string | null) {
  if (!userId || userId === 'anonymous') {
    return {
      error: 'Vous devez être connecté pour consulter vos réservations.',
      action: 'Connectez-vous sur /login.',
    };
  }

  const bookings = await prisma.booking.findMany({
    where: { guestId: userId },
    include: {
      property: { select: { name: true, slug: true, district: true } },
      extras: { include: { extra: { select: { name: true } } } },
    },
    orderBy: { checkIn: 'desc' },
    take: 5,
  });

  if (bookings.length === 0) {
    return { message: 'Vous n\'avez aucune réservation. Souhaitez-vous que je vous aide à en créer une ?' };
  }

  const statusLabels: Record<string, string> = {
    PENDING: 'En attente', CONFIRMED: 'Confirmée', CHECKED_IN: 'En cours',
    CHECKED_OUT: 'Terminée', CANCELLED: 'Annulée',
  };

  return {
    count: bookings.length,
    reservations: bookings.map((b) => ({
      id: b.id,
      bien: b.property.name,
      quartier: b.property.district,
      arrivee: b.checkIn.toISOString().split('T')[0],
      depart: b.checkOut.toISOString().split('T')[0],
      nuits: b.nights,
      voyageurs: b.guestsCount,
      total: `${b.totalAmount} MAD`,
      statut: statusLabels[b.status] || b.status,
      extras: b.extras.map((e: any) => e.extra.name),
    })),
  };
}

// =============================================
// NOUVEAUX TOOLS - KNOWLEDGE BASE MARRAKECH
// =============================================

// --- GET WEATHER (OpenWeatherMap API) ---
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || 'c248a745750c3e910096c3d07125ce6f';
const MARRAKECH_LAT = 31.6295;
const MARRAKECH_LON = -7.9811;

// Types pour OpenWeatherMap
interface OpenWeatherCurrent {
  main: { temp: number; feels_like: number; humidity: number; pressure: number };
  weather: { id: number; description: string }[];
  wind: { speed: number };
  visibility: number;
  sys: { sunrise: number; sunset: number };
}

interface OpenWeatherForecastItem {
  dt_txt: string;
  main: { temp: number; humidity: number };
  weather: { id: number; description: string }[];
  pop: number;
}

interface OpenWeatherForecast {
  list: OpenWeatherForecastItem[];
}

async function getWeather(args: { days?: number }) {
  const days = Math.min(args.days || 3, 7);
  
  try {
    // Appel API météo actuelle
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${MARRAKECH_LAT}&lon=${MARRAKECH_LON}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=fr`
    );
    const currentData = await currentRes.json() as OpenWeatherCurrent;
    
    // Appel API prévisions 5 jours
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${MARRAKECH_LAT}&lon=${MARRAKECH_LON}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=fr`
    );
    const forecastData = await forecastRes.json() as OpenWeatherForecast;
    
    // Transformer les données actuelles
    const weatherIcon = getWeatherEmoji(currentData.weather[0].id);
    const today = new Date();
    
    // Grouper les prévisions par jour
    const dailyForecasts = new Map<string, OpenWeatherForecastItem[]>();
    forecastData.list.forEach((item) => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyForecasts.has(date)) {
        dailyForecasts.set(date, []);
      }
      dailyForecasts.get(date)!.push(item);
    });
    
    // Construire les prévisions journalières
    const previsions: { date: string; jour: string; temp_max: number; temp_min: number; conditions: string; precipitation: string; humidite: string }[] = [];
    let count = 0;
    dailyForecasts.forEach((items, date) => {
      if (count >= days) return;
      
      const temps = items.map((i) => i.main.temp);
      const dateObj = new Date(date);
      
      previsions.push({
        date: date,
        jour: dateObj.toLocaleDateString('fr-FR', { weekday: 'long' }),
        temp_max: Math.round(Math.max(...temps)),
        temp_min: Math.round(Math.min(...temps)),
        conditions: `${getWeatherEmoji(items[Math.floor(items.length / 2)].weather[0].id)} ${items[Math.floor(items.length / 2)].weather[0].description}`,
        precipitation: items.some((i) => i.pop > 0.2) ? `${Math.round(Math.max(...items.map((i) => i.pop)) * 100)}%` : '0%',
        humidite: `${Math.round(items.reduce((acc, i) => acc + i.main.humidity, 0) / items.length)}%`,
      });
      count++;
    });
    
    const weatherData = {
      ville: 'Marrakech',
      pays: 'Maroc',
      mise_a_jour: new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Casablanca' }),
      source: 'OpenWeatherMap',
      actuel: {
        temperature: Math.round(currentData.main.temp),
        ressenti: Math.round(currentData.main.feels_like),
        conditions: `${weatherIcon} ${currentData.weather[0].description}`,
        humidite: `${currentData.main.humidity}%`,
        vent: `${Math.round(currentData.wind.speed * 3.6)} km/h`,
        pression: `${currentData.main.pressure} hPa`,
        visibilite: `${Math.round(currentData.visibility / 1000)} km`,
        lever_soleil: new Date(currentData.sys.sunrise * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Casablanca' }),
        coucher_soleil: new Date(currentData.sys.sunset * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Casablanca' }),
      },
      previsions: previsions,
      conseils: getWeatherAdvice(today, currentData.main.temp),
    };

    return weatherData;
    
  } catch (error) {
    console.error('Erreur API OpenWeatherMap:', error);
    // Fallback sur données statiques en cas d'erreur
    return getFallbackWeather(days);
  }
}

function getWeatherEmoji(weatherId: number): string {
  if (weatherId >= 200 && weatherId < 300) return '⛈️'; // Orage
  if (weatherId >= 300 && weatherId < 400) return '🌧️'; // Bruine
  if (weatherId >= 500 && weatherId < 600) return '🌧️'; // Pluie
  if (weatherId >= 600 && weatherId < 700) return '❄️'; // Neige
  if (weatherId >= 700 && weatherId < 800) return '🌫️'; // Brouillard
  if (weatherId === 800) return '☀️'; // Ciel dégagé
  if (weatherId === 801) return '🌤️'; // Quelques nuages
  if (weatherId === 802) return '⛅'; // Nuages épars
  if (weatherId >= 803) return '☁️'; // Nuageux
  return '🌡️';
}

function getWeatherAdvice(date: Date, currentTemp: number): string[] {
  const month = date.getMonth() + 1;
  const advice: string[] = [];
  
  // Conseils basés sur la température réelle
  if (currentTemp >= 35) {
    advice.push('🧴 Crème solaire indispensable (indice 50+)');
    advice.push('💧 Hydratez-vous très régulièrement');
    advice.push('🕐 Évitez les sorties entre 12h et 16h');
    advice.push('👒 Chapeau et lunettes de soleil obligatoires');
    advice.push('🏊 Idéal pour profiter de la piscine');
  } else if (currentTemp >= 25) {
    advice.push('🌡️ Températures agréables pour les visites');
    advice.push('🧴 Protection solaire recommandée');
    advice.push('👕 Prévoir une petite veste pour le soir');
    advice.push('🚶 Parfait pour explorer la Médina');
  } else if (currentTemp >= 15) {
    advice.push('🧥 Prévoir des vêtements chauds pour le soir');
    advice.push('👕 Tenue légère en journée');
    advice.push('🌡️ Journées douces, soirées fraîches');
    advice.push('🏔️ Idéal pour une excursion à l\'Atlas');
  } else {
    advice.push('🧥 Vêtements chauds recommandés');
    advice.push('☔ Un parapluie peut être utile');
    advice.push('🌡️ Températures fraîches');
  }
  
  // Conseils saisonniers
  if (month >= 5 && month <= 9) {
    advice.push('☀️ Indice UV élevé - protection solaire indispensable');
  }
  
  return advice;
}

function getFallbackWeather(days: number) {
  const today = new Date();
  const month = today.getMonth() + 1;
  let baseTemp = 22;
  
  if (month >= 6 && month <= 8) baseTemp = 35;
  else if (month >= 3 && month <= 5) baseTemp = 25;
  else if (month >= 9 && month <= 11) baseTemp = 24;
  else baseTemp = 18;
  
  return {
    ville: 'Marrakech',
    pays: 'Maroc',
    source: 'Données estimées (API indisponible)',
    actuel: {
      temperature: baseTemp,
      ressenti: baseTemp + 2,
      conditions: '☀️ Ensoleillé (estimation)',
      humidite: '35%',
      vent: '15 km/h',
    },
    previsions: Array.from({ length: days }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      return {
        date: date.toISOString().split('T')[0],
        jour: date.toLocaleDateString('fr-FR', { weekday: 'long' }),
        temp_max: baseTemp + 3,
        temp_min: baseTemp - 5,
        conditions: '☀️ Ensoleillé (estimation)',
      };
    }),
    conseils: getWeatherAdvice(today, baseTemp),
  };
}

// --- GET EVENTS (depuis la base de données) ---
async function getEvents(args: { start_date?: string; end_date?: string; category?: string }) {
  const startDate = args.start_date ? new Date(args.start_date) : new Date();
  const endDate = args.end_date ? new Date(args.end_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 jours par défaut
  const category = args.category?.toUpperCase() || 'all';

  try {
    // Récupérer les événements depuis la base de données
    const whereClause: any = {
      active: true,
      OR: [
        // Événements récurrents (toujours inclus)
        { isRecurring: true },
        // Événements ponctuels dans la période
        {
          AND: [
            { startDate: { lte: endDate } },
            {
              OR: [
                { endDate: { gte: startDate } },
                { endDate: null, startDate: { gte: startDate } },
              ],
            },
          ],
        },
      ],
    };

    // Filtre par catégorie
    if (category !== 'ALL') {
      whereClause.category = category;
    }

    const dbEvents = await prisma.event.findMany({
      where: whereClause,
      orderBy: [{ featured: 'desc' }, { startDate: 'asc' }],
    });

    // Transformer les événements pour le majordome
    const evenements = dbEvents.map((event) => ({
      nom: event.name,
      categorie: event.category.toLowerCase(),
      lieu: event.location,
      adresse: event.address,
      description: event.description,
      horaire: event.isRecurring
        ? formatRecurrence(event.recurrence, event.startTime)
        : formatEventDate(event.startDate, event.endDate, event.startTime),
      prix: event.price || 'Non communiqué',
      recurrent: event.isRecurring,
      special: event.featured,
      site_web: event.website,
      telephone: event.phone,
    }));

    // Si aucun événement en DB, retourner les événements par défaut
    if (evenements.length === 0) {
      return getDefaultEvents(startDate, endDate, category);
    }

    return {
      periode: {
        du: startDate.toISOString().split('T')[0],
        au: endDate.toISOString().split('T')[0],
      },
      categorie_filtree: category === 'ALL' ? 'toutes' : category.toLowerCase(),
      nombre_evenements: evenements.length,
      evenements: evenements,
      conseil: 'Pour les événements spéciaux, je vous recommande de réserver à l\'avance. Souhaitez-vous que j\'ajoute une activité à votre séjour ?',
    };
  } catch (error) {
    console.error('Erreur getEvents:', error);
    // Fallback sur les événements par défaut
    return getDefaultEvents(startDate, endDate, category);
  }
}

function formatRecurrence(recurrence: string | null, startTime: string | null): string {
  if (!recurrence) return startTime ? `À ${startTime}` : 'Horaires variables';
  
  const time = startTime ? ` à ${startTime}` : '';
  
  if (recurrence === 'daily') return `Tous les jours${time}`;
  if (recurrence.startsWith('weekly:')) {
    const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const dayNum = parseInt(recurrence.split(':')[1]);
    return `Tous les ${days[dayNum]}s${time}`;
  }
  if (recurrence.startsWith('monthly:')) {
    const dayOfMonth = recurrence.split(':')[1];
    return `Le ${dayOfMonth} de chaque mois${time}`;
  }
  
  return startTime ? `À ${startTime}` : 'Horaires variables';
}

function formatEventDate(startDate: Date, endDate: Date | null, startTime: string | null): string {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  const start = startDate.toLocaleDateString('fr-FR', options);
  const time = startTime ? ` à ${startTime}` : '';
  
  if (!endDate || startDate.toDateString() === endDate.toDateString()) {
    return `${start}${time}`;
  }
  
  const end = endDate.toLocaleDateString('fr-FR', options);
  return `Du ${start} au ${end}${time}`;
}

function getDefaultEvents(startDate: Date, endDate: Date, category: string) {
  // Événements par défaut si la DB est vide
  const allEvents = [
    {
      nom: 'Soirée Gnaoua au Café Clock',
      categorie: 'musique',
      lieu: 'Café Clock, Médina',
      description: 'Concert de musique Gnaoua traditionnelle avec dîner marocain',
      horaire: 'Tous les jeudis, 20h30',
      prix: '200 MAD (avec dîner)',
      recurrent: true,
    },
    {
      nom: 'Spectacle Fantasia',
      categorie: 'tradition',
      lieu: 'Chez Ali, Route de Casablanca',
      description: 'Dîner-spectacle avec cavaliers berbères, acrobates et folklore marocain',
      horaire: 'Tous les soirs, 20h',
      prix: '450 MAD',
      recurrent: true,
    },
    {
      nom: 'Visite guidée des souks',
      categorie: 'culture',
      lieu: 'Place Jemaa el-Fna',
      description: 'Découverte des artisans et secrets de la Médina avec un guide local',
      horaire: 'Tous les jours, 9h30',
      prix: '350 MAD/personne',
      recurrent: true,
    },
    {
      nom: 'Cours de cuisine marocaine',
      categorie: 'gastronomie',
      lieu: 'La Maison Arabe',
      description: 'Apprenez à préparer tajine, couscous et pastilla avec un chef',
      horaire: 'Lundi, Mercredi, Vendredi, 10h',
      prix: '800 MAD',
      recurrent: true,
    },
  ];

  const filteredEvents = category === 'ALL' 
    ? allEvents 
    : allEvents.filter(e => e.categorie === category.toLowerCase());

  return {
    periode: {
      du: startDate.toISOString().split('T')[0],
      au: endDate.toISOString().split('T')[0],
    },
    categorie_filtree: category === 'ALL' ? 'toutes' : category.toLowerCase(),
    nombre_evenements: filteredEvents.length,
    evenements: filteredEvents,
    source: 'Événements par défaut - Ajoutez vos événements via l\'admin',
    conseil: 'Pour les événements spéciaux, je vous recommande de réserver à l\'avance.',
  };
}

// --- GET CITY TIPS ---
async function getCityTips(args: { topic: string; district?: string }) {
  const tips: Record<string, any> = {
    quartiers: {
      titre: 'Guide des quartiers de Marrakech',
      quartiers: {
        'Médina': {
          description: 'Le cœur historique, classé UNESCO. Ruelles labyrinthiques, souks, riads.',
          ambiance: 'Authentique, animée, dépaysante',
          pour_qui: 'Amateurs de culture et d\'immersion',
          a_voir: ['Place Jemaa el-Fna', 'Medersa Ben Youssef', 'Souks', 'Palais Bahia'],
          conseils: ['GPS inutile - suivez votre instinct ou un guide', 'Négociez toujours (divisez le premier prix par 3)', 'Visitez tôt le matin pour éviter la foule'],
        },
        'Guéliz': {
          description: 'La ville nouvelle, créée sous le protectorat français. Cafés, boutiques modernes.',
          ambiance: 'Moderne, européenne, pratique',
          pour_qui: 'Ceux qui veulent mixer tradition et confort moderne',
          a_voir: ['Avenue Mohammed V', 'Jardin Majorelle (à côté)', 'Galeries d\'art'],
          conseils: ['Idéal pour le shopping de marques', 'Restaurants internationaux', 'Vie nocturne animée'],
        },
        'Hivernage': {
          description: 'Quartier résidentiel chic avec grands hôtels et casinos.',
          ambiance: 'Luxueuse, calme, verdoyante',
          pour_qui: 'Voyageurs cherchant le grand luxe',
          a_voir: ['Théâtre Royal', 'Palais des Congrès', 'Jardins'],
          conseils: ['Les meilleurs spas de la ville', 'Proche de tout en taxi'],
        },
        'Palmeraie': {
          description: '100 000 palmiers, villas somptueuses, clubs et resorts.',
          ambiance: 'Exclusive, paisible, nature',
          pour_qui: 'Familles, couples, groupes cherchant l\'espace et l\'intimité',
          a_voir: ['Balade en quad ou chameau', 'Golf', 'Piscines privées'],
          conseils: ['20 min du centre - prévoir taxi/voiture', 'Parfait pour se ressourcer'],
        },
        'Mellah': {
          description: 'L\'ancien quartier juif, avec son marché aux épices et son cimetière historique.',
          ambiance: 'Authentique, moins touristique',
          pour_qui: 'Curieux d\'histoire et de diversité culturelle',
          a_voir: ['Synagogue Slat al-Azama', 'Marché aux épices', 'Place des Ferblantiers'],
          conseils: ['Épices moins chères qu\'en Médina', 'Artisans du cuivre'],
        },
      },
    },
    transport: {
      titre: 'Se déplacer à Marrakech',
      options: {
        'Petits taxis': {
          description: 'Taxis beiges pour 3 personnes max, intra-muros uniquement',
          prix: '10-30 MAD selon distance',
          conseils: ['Exigez le compteur ou négociez AVANT', 'Ayez de la monnaie', 'Careem/Roby plus fiables'],
        },
        'Grands taxis': {
          description: 'Mercedes beiges, pour les trajets hors ville (aéroport, excursions)',
          prix: '150-200 MAD vers aéroport',
          conseils: ['Prix fixe, négociez avant', 'Partagés ou privés'],
        },
        'Calèches': {
          description: 'Balade romantique autour des remparts',
          prix: '150-300 MAD/heure',
          conseils: ['Négociez le circuit et le prix avant', 'Évitez aux heures chaudes'],
        },
        'Apps VTC': {
          description: 'Careem et Roby - comme Uber',
          avantages: 'Prix fixés, paiement par carte, pas de négociation',
        },
        'Location voiture': {
          conseils: ['Évitez de conduire en Médina', 'Parking gardé : 20-30 MAD', 'Permis international recommandé'],
        },
      },
    },
    argent: {
      titre: 'Argent et pourboires',
      devise: 'Dirham marocain (MAD)',
      taux_indicatif: '1€ ≈ 11 MAD',
      paiement: {
        carte: 'Acceptée dans hôtels, restaurants chics, grandes boutiques',
        cash: 'Indispensable pour souks, petits commerces, taxis, pourboires',
      },
      pourboires: {
        restaurant: '10% (souvent non inclus)',
        hotel: '20-50 MAD/jour pour le ménage',
        guide: '100-200 MAD/demi-journée',
        taxi: 'Arrondir au supérieur',
        hammam: '50-100 MAD',
      },
      negociation: {
        ou: 'Souks, marchés, taxis sans compteur',
        comment: ['Commencez à 30% du prix annoncé', 'Restez souriant et patient', 'Prêt à partir = meilleur prix', 'Prix fixes en boutiques modernes'],
      },
    },
    culture: {
      titre: 'Us et coutumes',
      respect: {
        vetements: 'Épaules et genoux couverts recommandés, surtout en Médina et mosquées',
        mosquees: 'Entrée interdite aux non-musulmans (sauf Hassan II à Casablanca)',
        photos: 'Demander permission pour photographier les gens',
        ramadan: 'Évitez de manger/boire/fumer en public pendant le jeûne',
      },
      salutations: {
        bonjour: 'Salam (سلام) ou Salam Aleikoum',
        merci: 'Choukran (شكرا)',
        oui_non: 'Iyeh / La',
      },
      hospitalite: 'Le thé à la menthe est un signe d\'accueil - l\'accepter est poli',
    },
    securite: {
      titre: 'Sécurité et précautions',
      niveau: 'Marrakech est une ville sûre pour les touristes',
      conseils: [
        'Gardez vos objets de valeur discrets',
        'Évitez les ruelles isolées la nuit',
        'Méfiez-vous des "faux guides" trop insistants',
        'Eau du robinet non potable - buvez de l\'eau en bouteille',
        'Négociez les prix AVANT tout service',
      ],
      arnaques_courantes: [
        'Le guide "gratuit" qui demande de l\'argent à la fin',
        'Le souk "fermé" - on vous emmène ailleurs',
        'L\'ami qui veut vous montrer sa coopérative familiale',
      ],
      numeros_utiles: {
        police: '19',
        tourisme: '+212 524 43 61 31',
        urgences: '15',
      },
    },
    shopping: {
      titre: 'Shopping et souks',
      specialites: {
        'Cuir': 'Babouches, sacs, poufs - quartier des tanneurs',
        'Tapis': 'Berbères (géométriques) ou citadins (floraux)',
        'Épices': 'Safran, ras el hanout, cumin - Mellah moins cher',
        'Poterie': 'Tajines, céramique de Safi',
        'Argan': 'Huile alimentaire et cosmétique',
        'Lanternes': 'Fer forgé et verre coloré',
      },
      conseils: [
        'Comparez les prix dans plusieurs boutiques',
        'Le premier prix est 2-3x le prix réel',
        'Achetez en fin de journée (vendeurs plus flexibles)',
        'Demandez un certificat pour les tapis de valeur',
      ],
    },
    restaurants: {
      titre: 'Où manger à Marrakech',
      types: {
        'Gastronomique': {
          exemples: ['La Mamounia', 'Dar Yacout', 'Le Jardin'],
          budget: '500-1500 MAD/personne',
        },
        'Bon rapport qualité-prix': {
          exemples: ['Nomad', 'Café des Épices', 'La Famille'],
          budget: '150-300 MAD/personne',
        },
        'Street food': {
          exemples: ['Jemaa el-Fna (soir)', 'Chez Bejgueni', 'Haj Mustapha'],
          budget: '30-80 MAD',
          incontournables: ['Tangia', 'Méchoui', 'Brochettes', 'Jus d\'orange frais'],
        },
      },
      conseils: [
        'Réservez pour les restaurants gastronomiques',
        'Street food Jemaa el-Fna : choisissez les stands avec du monde',
        'Évitez les restaurants qui vous hèlent depuis la rue',
      ],
    },
    vie_nocturne: {
      titre: 'Sortir le soir',
      options: {
        'Rooftops': {
          exemples: ['Café Arabe', 'Kosybar', 'Le Salama'],
          description: 'Coucher de soleil et cocktails',
        },
        'Clubs': {
          exemples: ['Theatro', 'So Lounge', 'Pacha'],
          quartier: 'Hivernage principalement',
          dress_code: 'Smart casual, pas de baskets',
        },
        'Dîner-spectacle': {
          exemples: ['Comptoir Darna', 'Lotus Club'],
          description: 'Danse du ventre et musique live',
        },
      },
      conseil: 'La vie nocturne se concentre à Guéliz et Hivernage. La Médina est calme après 22h.',
    },
    excursions: {
      titre: 'Excursions depuis Marrakech',
      journee: [
        {
          destination: 'Vallée de l\'Ourika',
          duree: '1 jour',
          distance: '60 km',
          a_voir: 'Cascades, villages berbères, jardins de safran',
        },
        {
          destination: 'Essaouira',
          duree: '1 jour',
          distance: '180 km',
          a_voir: 'Port de pêche, médina UNESCO, plage, musique gnaoua',
        },
        {
          destination: 'Cascades d\'Ouzoud',
          duree: '1 jour',
          distance: '150 km',
          a_voir: 'Plus hautes cascades du Maroc (110m), singes magots',
        },
        {
          destination: 'Ait Ben Haddou',
          duree: '1 jour',
          distance: '190 km',
          a_voir: 'Ksar UNESCO, décor de Game of Thrones et Gladiator',
        },
      ],
      plusieurs_jours: [
        {
          destination: 'Désert de Merzouga',
          duree: '2-3 jours',
          a_voir: 'Dunes de l\'Erg Chebbi, nuit en bivouac, lever de soleil',
        },
        {
          destination: 'Fès via le Moyen Atlas',
          duree: '2-3 jours',
          a_voir: 'Cèdres, singes, médina de Fès (plus grande du monde)',
        },
      ],
    },
    general: {
      titre: 'Conseils généraux pour Marrakech',
      resume: [
        '🕌 Respect : épaules/genoux couverts en Médina',
        '💰 Cash : indispensable pour les souks et taxis',
        '🗣️ Négociation : divisez le premier prix par 3',
        '🚕 Taxis : compteur ou prix fixé AVANT',
        '☀️ Soleil : crème solaire et chapeau toute l\'année',
        '💧 Eau : buvez uniquement de l\'eau en bouteille',
        '🍵 Thé : accepter = politesse',
        '📱 Apps : Careem pour les VTC, pas de Uber',
      ],
    },
  };

  // Si un quartier spécifique est demandé avec le topic "quartiers"
  if (args.topic === 'quartiers' && args.district) {
    const districtInfo = tips.quartiers.quartiers[args.district];
    if (districtInfo) {
      return {
        quartier: args.district,
        ...districtInfo,
      };
    }
  }

  const result = tips[args.topic] || tips.general;
  
  return {
    ...result,
    source: 'Guide local Marrakech Access',
    mise_a_jour: new Date().toISOString().split('T')[0],
  };
}

// --- ADD TO CART ---
async function addToCart(args: {
  type: 'property' | 'extra';
  slug?: string;
  extra_name?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  quantity?: number;
}) {
  if (args.type === 'property') {
    if (!args.slug) {
      return { error: 'Le slug du bien est requis pour ajouter un hébergement au panier.' };
    }

    const property = await prisma.property.findFirst({
      where: { slug: args.slug, status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        district: true,
        capacity: true,
        priceLowSeason: true,
        priceHighSeason: true,
        cleaningFee: true,
        minNights: true,
        currency: true,
      },
    });

    if (!property) {
      return { error: 'Ce bien n\'existe pas ou n\'est plus disponible.' };
    }

    // Calculer les nuits si dates fournies
    let nights = 0;
    let totalEstimate = 0;
    if (args.check_in && args.check_out) {
      const checkIn = new Date(args.check_in);
      const checkOut = new Date(args.check_out);
      nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      
      if (nights < property.minNights) {
        return { 
          error: `Séjour minimum de ${property.minNights} nuit(s) requis pour ce bien.`,
          minimum_nights: property.minNights,
        };
      }
      
      const month = checkIn.getMonth() + 1;
      const isHighSeason = [3, 4, 5, 10, 11, 12].includes(month);
      const pricePerNight = isHighSeason ? Number(property.priceHighSeason) : Number(property.priceLowSeason);
      totalEstimate = pricePerNight * nights + Number(property.cleaningFee);
    }

    return {
      action: 'add_property_to_cart',
      success: true,
      message: `J'ai préparé ${property.name} pour votre panier.`,
      property: {
        id: property.id,
        name: property.name,
        slug: property.slug,
        type: property.type,
        district: property.district,
        capacity: property.capacity,
        priceLowSeason: Number(property.priceLowSeason),
        priceHighSeason: Number(property.priceHighSeason),
        cleaningFee: Number(property.cleaningFee),
        minNights: property.minNights,
        currency: property.currency,
      },
      dates: args.check_in && args.check_out ? {
        checkIn: args.check_in,
        checkOut: args.check_out,
        nights,
      } : null,
      guests: args.guests || 1,
      estimatedTotal: totalEstimate > 0 ? `${totalEstimate.toLocaleString()} ${property.currency}` : null,
      instructions: 'Cliquez sur "Ajouter au panier" pour confirmer, ou modifiez vos dates sur la fiche du bien.',
      link: `/properties/${property.slug}`,
    };
  }

  if (args.type === 'extra') {
    if (!args.extra_name) {
      return { error: 'Le nom de l\'extra est requis.' };
    }

    const extra = await prisma.extra.findFirst({
      where: { 
        name: { contains: args.extra_name },
        available: true,
      },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        price: true,
        priceUnit: true,
        duration: true,
      },
    });

    if (!extra) {
      // Chercher des extras similaires
      const similarExtras = await prisma.extra.findMany({
        where: { available: true },
        select: { name: true, category: true },
        take: 5,
      });
      
      return { 
        error: `Extra "${args.extra_name}" non trouvé.`,
        suggestions: similarExtras.map(e => e.name),
      };
    }

    const quantity = args.quantity || 1;
    const total = Number(extra.price) * quantity;

    return {
      action: 'add_extra_to_cart',
      success: true,
      message: `J'ai préparé "${extra.name}" pour votre panier.`,
      extra: {
        id: extra.id,
        name: extra.name,
        category: extra.category,
        description: extra.description,
        price: Number(extra.price),
        priceUnit: extra.priceUnit,
        duration: extra.duration,
        quantity,
      },
      total: `${total.toLocaleString()} MAD`,
      instructions: 'L\'extra sera ajouté à votre réservation.',
    };
  }

  return { error: 'Type non reconnu. Utilisez "property" ou "extra".' };
}

// --- GET RECOMMENDATIONS ---
async function getRecommendations(args: {
  context: string;
  budget_per_night?: number;
  guests?: number;
  interests?: string[];
}) {
  const recommendations: any = {
    properties: [],
    extras: [],
    tips: [],
  };

  // Logique de recommandation basée sur le contexte
  const contextProfiles: Record<string, { 
    propertyTypes: string[], 
    districts: string[], 
    extraCategories: string[],
    tips: string[]
  }> = {
    romantique: {
      propertyTypes: ['RIAD', 'DAR', 'SUITE'],
      districts: ['Médina', 'Hivernage'],
      extraCategories: ['bien-etre', 'culinaire'],
      tips: [
        '💑 Réservez un dîner aux chandelles sur un rooftop',
        '🌹 Demandez une décoration romantique à l\'arrivée',
        '🧖 Optez pour un hammam en couple',
      ],
    },
    famille: {
      propertyTypes: ['VILLA', 'APPARTEMENT'],
      districts: ['Palmeraie', 'Amelkis'],
      extraCategories: ['excursion', 'loisir'],
      tips: [
        '👨‍👩‍👧‍👦 Les villas avec piscine sont idéales pour les enfants',
        '🐪 Une balade à dos de chameau plaît à tous les âges',
        '🎨 Atelier poterie ou cuisine pour occuper les petits',
      ],
    },
    groupe_amis: {
      propertyTypes: ['VILLA', 'RIAD'],
      districts: ['Palmeraie', 'Guéliz'],
      extraCategories: ['loisir', 'excursion', 'culinaire'],
      tips: [
        '🎉 Les villas avec piscine permettent de faire la fête',
        '🏍️ Quad ou buggy dans le désert pour l\'adrénaline',
        '🍽️ Réservez un chef à domicile pour une soirée mémorable',
      ],
    },
    affaires: {
      propertyTypes: ['APPARTEMENT', 'SUITE'],
      districts: ['Guéliz', 'Hivernage'],
      extraCategories: ['transport'],
      tips: [
        '💼 Choisissez un hébergement avec wifi haut débit',
        '🚗 Réservez un chauffeur pour vos déplacements',
        '🍸 Guéliz offre les meilleurs espaces de coworking',
      ],
    },
    luxe: {
      propertyTypes: ['VILLA', 'RIAD'],
      districts: ['Palmeraie', 'Hivernage'],
      extraCategories: ['bien-etre', 'culinaire', 'transport'],
      tips: [
        '✨ Demandez un service de conciergerie premium',
        '🚁 Excursion en hélicoptère vers l\'Atlas disponible',
        '👨‍🍳 Chef étoilé à domicile sur réservation',
      ],
    },
    budget: {
      propertyTypes: ['APPARTEMENT', 'DAR'],
      districts: ['Médina', 'Mellah'],
      extraCategories: ['excursion'],
      tips: [
        '💰 La Médina offre le meilleur rapport qualité-prix',
        '🚶 Explorez à pied pour économiser sur les transports',
        '🍜 Street food à Jemaa el-Fna pour manger bien et pas cher',
      ],
    },
    aventure: {
      propertyTypes: ['VILLA', 'RIAD'],
      districts: ['Palmeraie', 'Amelkis'],
      extraCategories: ['excursion', 'loisir'],
      tips: [
        '🏔️ Randonnée dans l\'Atlas à 1h de Marrakech',
        '🏍️ Quad, buggy et motocross dans le désert d\'Agafay',
        '🎈 Vol en montgolfière au lever du soleil',
      ],
    },
    detente: {
      propertyTypes: ['RIAD', 'VILLA'],
      districts: ['Palmeraie', 'Médina'],
      extraCategories: ['bien-etre'],
      tips: [
        '🧖 Hammam traditionnel obligatoire',
        '🧘 Yoga et méditation disponibles',
        '🌿 Les riads avec jardin intérieur sont parfaits pour se ressourcer',
      ],
    },
  };

  const profile = contextProfiles[args.context] || contextProfiles.detente;

  // Recherche des propriétés
  const propertyWhere: any = {
    status: 'ACTIVE',
    type: { in: profile.propertyTypes },
  };
  
  if (args.budget_per_night) {
    propertyWhere.priceLowSeason = { lte: args.budget_per_night };
  }
  if (args.guests) {
    propertyWhere.capacity = { gte: args.guests };
  }

  const properties = await prisma.property.findMany({
    where: propertyWhere,
    select: {
      name: true,
      slug: true,
      type: true,
      district: true,
      priceLowSeason: true,
      shortDesc: true,
      capacity: true,
    },
    orderBy: { priceLowSeason: 'asc' },
    take: 3,
  });

  recommendations.properties = properties.map(p => ({
    nom: p.name,
    type: p.type,
    quartier: p.district,
    prix: `${p.priceLowSeason} MAD/nuit`,
    capacite: `${p.capacity} voyageurs`,
    description: p.shortDesc,
    lien: `/properties/${p.slug}`,
  }));

  // Recherche des extras
  const extras = await prisma.extra.findMany({
    where: {
      available: true,
      category: { in: profile.extraCategories },
    },
    select: {
      name: true,
      category: true,
      price: true,
      priceUnit: true,
      description: true,
    },
    take: 4,
  });

  recommendations.extras = extras.map(e => ({
    nom: e.name,
    categorie: e.category,
    prix: `${e.price} MAD/${e.priceUnit}`,
    description: e.description,
  }));

  recommendations.tips = profile.tips;

  return {
    contexte: args.context,
    message: `Voici mes recommandations pour un séjour ${args.context} à Marrakech :`,
    hebergements: recommendations.properties.length > 0
      ? recommendations.properties
      : 'Aucun hébergement ne correspond exactement à vos critères, mais je peux élargir la recherche.',
    experiences: recommendations.extras,
    conseils_personnalises: recommendations.tips,
  };
}

// =============================================
// TOOLS VENTES
// =============================================

// --- GET SIMILAR PROPERTIES ---
async function getSimilarProperties(args: {
  excluded_slug: string;
  capacity: number;
  type?: string;
  district?: string;
  max_budget?: number;
  check_in?: string;
  check_out?: string;
}) {
  const baseWhere: any = {
    status: 'ACTIVE',
    slug: { not: args.excluded_slug },
    capacity: { gte: args.capacity },
  };
  if (args.type) baseWhere.type = args.type;
  if (args.max_budget) baseWhere.priceLowSeason = { lte: args.max_budget };

  // Essaie d'abord dans le même quartier, puis sans filtre quartier
  const whereVariants = args.district
    ? [{ ...baseWhere, district: args.district }, baseWhere]
    : [baseWhere];

  let properties: any[] = [];
  for (const where of whereVariants) {
    properties = await prisma.property.findMany({
      where,
      select: {
        name: true, slug: true, type: true, district: true,
        bedrooms: true, capacity: true, priceLowSeason: true,
        priceHighSeason: true, cleaningFee: true, shortDesc: true, minNights: true,
      },
      orderBy: { priceLowSeason: 'asc' },
      take: 5,
    });
    if (properties.length > 0) break;
  }

  // Si dates fournies, filtre sur la disponibilité réelle
  if (args.check_in && args.check_out && properties.length > 0) {
    const checkIn = new Date(args.check_in);
    const checkOut = new Date(args.check_out);
    const available: typeof properties = [];
    for (const prop of properties) {
      const overlap = await prisma.booking.findFirst({
        where: {
          property: { slug: prop.slug },
          status: { in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'] },
          OR: [{ checkIn: { lt: checkOut }, checkOut: { gt: checkIn } }],
        },
      });
      if (!overlap) available.push(prop);
    }
    properties = available;
  }

  if (properties.length === 0) {
    return { message: 'Aucune alternative disponible pour ces critères.', properties: [] };
  }

  return {
    count: properties.length,
    message: 'Voici des alternatives disponibles :',
    properties: properties.slice(0, 3).map(p => ({
      nom: p.name, slug: p.slug, type: p.type, quartier: p.district,
      chambres: p.bedrooms, capacite: p.capacity,
      prix_basse_saison: `${p.priceLowSeason} MAD/nuit`,
      prix_haute_saison: `${p.priceHighSeason} MAD/nuit`,
      description: p.shortDesc, nuits_minimum: p.minNights,
      lien: `/properties/${p.slug}`,
    })),
  };
}

// --- GET UPSELL SUGGESTIONS ---
async function getUpsellSuggestions(args: {
  property_slug: string;
  context?: string;
  guests?: number;
}) {
  const contextToCategories: Record<string, string[]> = {
    romantique:   ['bien-etre', 'culinaire'],
    famille:      ['excursion', 'loisir', 'culinaire'],
    groupe_amis:  ['loisir', 'excursion', 'culinaire'],
    affaires:     ['transport'],
    luxe:         ['bien-etre', 'culinaire', 'transport'],
    aventure:     ['excursion', 'loisir'],
    detente:      ['bien-etre', 'culinaire'],
  };

  const categories = args.context
    ? (contextToCategories[args.context] || ['bien-etre', 'excursion', 'culinaire'])
    : ['bien-etre', 'excursion', 'culinaire'];

  const extras = await prisma.extra.findMany({
    where: { available: true, category: { in: categories } },
    select: {
      id: true, name: true, category: true, description: true,
      price: true, priceUnit: true, duration: true, maxPersons: true,
    },
    orderBy: { sortOrder: 'asc' },
    take: 3,
  });

  if (extras.length === 0) {
    return { message: 'Aucun extra disponible pour le moment.', extras: [] };
  }

  const pitches: Record<string, string> = {
    romantique:  'Pour rendre ce séjour encore plus inoubliable',
    famille:     'Pour que toute la famille profite au maximum',
    groupe_amis: 'Pour des souvenirs mémorables entre amis',
    luxe:        'Pour une expérience d\'exception',
    detente:     'Pour un ressourcement complet',
    aventure:    'Pour pousser l\'aventure encore plus loin',
  };

  return {
    pitch: pitches[args.context || ''] || 'Pour enrichir votre séjour',
    extras: extras.map(e => ({
      id: e.id, nom: e.name, categorie: e.category,
      description: e.description,
      prix: `${e.price} MAD/${e.priceUnit}`,
      duree: e.duration, max_personnes: e.maxPersons,
    })),
    message_commercial: 'Ces expériences sont très appréciées par nos clients. Souhaitez-vous en ajouter une ?',
  };
}

// =============================================
// TOOLS ADMIN
// =============================================

// --- GET ADMIN DASHBOARD ---
async function getAdminDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  const [
    newBookingsToday,
    bookingsThisMonth,
    pendingBookings,
    openTickets,
    urgentTickets,
    revenueThisMonth,
    activeProperties,
    checkInsToday,
    checkOutsToday,
  ] = await Promise.all([
    prisma.booking.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
    prisma.booking.count({ where: { createdAt: { gte: monthStart, lt: nextMonthStart } } }),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.ticket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
    prisma.ticket.count({ where: { status: 'OPEN', priority: 'URGENT' } }),
    prisma.booking.aggregate({
      where: {
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] },
        createdAt: { gte: monthStart, lt: nextMonthStart },
      },
      _sum: { totalAmount: true },
    }),
    prisma.property.count({ where: { status: 'ACTIVE' } }),
    prisma.booking.count({ where: { checkIn: { gte: today, lt: tomorrow }, status: 'CONFIRMED' } }),
    prisma.booking.count({ where: { checkOut: { gte: today, lt: tomorrow }, status: 'CHECKED_IN' } }),
  ]);

  const alertes: string[] = [];
  if (urgentTickets > 0) alertes.push(`🚨 ${urgentTickets} ticket(s) URGENT(s) en attente`);
  if (pendingBookings > 0) alertes.push(`⏳ ${pendingBookings} réservation(s) à confirmer`);
  if (alertes.length === 0) alertes.push('✅ Aucune alerte en cours');

  return {
    date: today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
    activite_du_jour: {
      nouvelles_reservations: newBookingsToday,
      arrivees_prevues: checkInsToday,
      departs_prevus: checkOutsToday,
    },
    a_traiter: {
      reservations_en_attente: pendingBookings,
      tickets_ouverts: openTickets,
      tickets_urgents: urgentTickets,
    },
    mois_en_cours: {
      reservations: bookingsThisMonth,
      chiffre_affaires: `${Number(revenueThisMonth._sum.totalAmount || 0).toLocaleString('fr-FR')} MAD`,
    },
    plateforme: { biens_actifs: activeProperties },
    alertes,
  };
}

// --- GET PENDING ITEMS ---
async function getPendingItems(args: { type?: 'bookings' | 'tickets' | 'all' }) {
  const type = args.type || 'all';
  const result: any = {};

  if (type === 'bookings' || type === 'all') {
    const bookings = await prisma.booking.findMany({
      where: { status: 'PENDING' },
      include: {
        property: { select: { name: true } },
        guest: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });

    result.reservations_en_attente = bookings.map(b => ({
      id: b.id,
      client: `${b.guest.firstName} ${b.guest.lastName}`,
      email: b.guest.email,
      bien: b.property.name,
      arrivee: b.checkIn.toISOString().split('T')[0],
      depart: b.checkOut.toISOString().split('T')[0],
      nuits: b.nights,
      total: `${Number(b.totalAmount).toLocaleString('fr-FR')} MAD`,
      en_attente_depuis: `${Math.floor((Date.now() - b.createdAt.getTime()) / (1000 * 60 * 60))}h`,
    }));
  }

  if (type === 'tickets' || type === 'all') {
    const tickets = await prisma.ticket.findMany({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
      include: {
        creator: { select: { firstName: true, lastName: true } },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      take: 10,
    });

    result.tickets_ouverts = tickets.map(t => ({
      id: t.id,
      sujet: t.subject,
      type: t.type,
      priorite: t.priority,
      statut: t.status,
      client: `${t.creator.firstName} ${t.creator.lastName}`,
      ouvert_depuis: `${Math.floor((Date.now() - t.createdAt.getTime()) / (1000 * 60 * 60))}h`,
    }));
  }

  return result;
}

// --- UPDATE BOOKING STATUS ---
async function updateBookingStatus(args: {
  booking_id: string;
  status: 'CONFIRMED' | 'CANCELLED';
  reason?: string;
}) {
  const booking = await prisma.booking.findUnique({
    where: { id: args.booking_id },
    include: {
      property: { select: { name: true } },
      guest: { select: { firstName: true, lastName: true, email: true } },
    },
  });

  if (!booking) return { error: `Réservation ${args.booking_id} introuvable.` };

  await prisma.booking.update({
    where: { id: args.booking_id },
    data: {
      status: args.status,
      ...(args.reason ? { internalNotes: args.reason } : {}),
    },
  });

  const label = args.status === 'CONFIRMED' ? 'confirmée' : 'annulée';

  return {
    succes: true,
    message: `La réservation de ${booking.guest.firstName} ${booking.guest.lastName} pour "${booking.property.name}" a été ${label}.`,
    reservation: {
      id: booking.id,
      client: `${booking.guest.firstName} ${booking.guest.lastName}`,
      email: booking.guest.email,
      bien: booking.property.name,
      arrivee: booking.checkIn.toISOString().split('T')[0],
      depart: booking.checkOut.toISOString().split('T')[0],
      nouveau_statut: args.status,
    },
  };
}