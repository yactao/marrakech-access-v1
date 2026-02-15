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
];

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
    // Nouveaux tools Knowledge Base
    case 'get_weather':
      return getWeather(args);
    case 'get_events':
      return getEvents(args);
    case 'get_city_tips':
      return getCityTips(args);
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

// --- GET EVENTS ---
async function getEvents(args: { start_date?: string; end_date?: string; category?: string }) {
  const startDate = args.start_date ? new Date(args.start_date) : new Date();
  const endDate = args.end_date ? new Date(args.end_date) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const category = args.category || 'all';

  // Base d'événements récurrents et saisonniers de Marrakech
  const allEvents = [
    // Événements récurrents
    {
      nom: 'Soirée Gnaoua au Café Clock',
      categorie: 'musique',
      lieu: 'Café Clock, Médina',
      description: 'Concert de musique Gnaoua traditionnelle avec dîner marocain',
      horaire: 'Tous les jeudis, 20h30',
      prix: '200 MAD (avec dîner)',
      recurrent: true,
      jour_semaine: 4, // Jeudi
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
      nom: 'Cours de cuisine marocaine',
      categorie: 'gastronomie',
      lieu: 'La Maison Arabe',
      description: 'Apprenez à préparer tajine, couscous et pastilla avec un chef',
      horaire: 'Lundi, Mercredi, Vendredi, 10h',
      prix: '800 MAD',
      recurrent: true,
      jours_semaine: [1, 3, 5],
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
      nom: 'Hammam & Massage traditionnel',
      categorie: 'tradition',
      lieu: 'Les Bains de Marrakech',
      description: 'Rituel complet : gommage au savon noir, massage à l\'huile d\'argan',
      horaire: 'Sur réservation',
      prix: 'À partir de 600 MAD',
      recurrent: true,
    },
    // Festivals annuels (dates approximatives)
    {
      nom: 'Festival International du Film de Marrakech',
      categorie: 'culture',
      lieu: 'Palais des Congrès',
      description: 'Stars internationales, projections et tapis rouge',
      date_debut: '2025-11-29',
      date_fin: '2025-12-07',
      prix: 'Gratuit - Sur invitation',
      special: true,
    },
    {
      nom: 'Marathon de Marrakech',
      categorie: 'sport',
      lieu: 'Départ Place Jemaa el-Fna',
      description: '42km à travers la ville ocre, ambiance festive garantie',
      date_debut: '2026-01-26',
      date_fin: '2026-01-26',
      prix: '50€ inscription',
      special: true,
    },
    {
      nom: 'Festival Gnaoua & Musiques du Monde',
      categorie: 'musique',
      lieu: 'Essaouira (2h30 de Marrakech)',
      description: 'Le plus grand festival de musique du Maroc, artistes internationaux',
      date_debut: '2026-06-25',
      date_fin: '2026-06-28',
      prix: 'Gratuit',
      special: true,
    },
  ];

  // Filtrer les événements
  const filteredEvents = allEvents.filter(event => {
    // Filtre catégorie
    if (category !== 'all' && event.categorie !== category) return false;
    
    // Événements récurrents : toujours inclus
    if ((event as any).recurrent) return true;
    
    // Événements spéciaux : vérifier les dates
    if ((event as any).date_debut) {
      const eventStart = new Date((event as any).date_debut);
      const eventEnd = new Date((event as any).date_fin);
      return eventStart <= endDate && eventEnd >= startDate;
    }
    
    return true;
  });

  return {
    periode: {
      du: startDate.toISOString().split('T')[0],
      au: endDate.toISOString().split('T')[0],
    },
    categorie_filtree: category,
    nombre_evenements: filteredEvents.length,
    evenements: filteredEvents,
    conseil: 'Pour les événements spéciaux, je vous recommande de réserver à l\'avance. Souhaitez-vous que j\'ajoute une activité à votre séjour ?',
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