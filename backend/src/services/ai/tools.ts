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