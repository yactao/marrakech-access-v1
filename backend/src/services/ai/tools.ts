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
];

// =============================================
// EXÉCUTION DES TOOLS
// =============================================

export async function executeTool(name: string, args: any): Promise<any> {
  switch (name) {
    case 'search_properties':
      return searchProperties(args);
    case 'get_property_details':
      return getPropertyDetails(args);
    case 'search_extras':
      return searchExtras(args);
    case 'search_knowledge':
      return searchKnowledge(args);
    default:
      return { error: `Outil inconnu : ${name}` };
  }
}

// --- SEARCH PROPERTIES ---
async function searchProperties(args: {
  district?: string;
  type?: string;
  min_capacity?: number;
  max_budget?: number;
  bedrooms?: number;
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
      name: true,
      slug: true,
      type: true,
      district: true,
      bedrooms: true,
      bathrooms: true,
      capacity: true,
      surface: true,
      priceLowSeason: true,
      priceHighSeason: true,
      shortDesc: true,
      amenities: true,
      minNights: true,
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
      nom: p.name,
      slug: p.slug,
      type: p.type,
      quartier: p.district,
      chambres: p.bedrooms,
      capacite: p.capacity,
      surface: `${p.surface}m²`,
      prix_basse_saison: `${p.priceLowSeason} MAD/nuit`,
      prix_haute_saison: `${p.priceHighSeason} MAD/nuit`,
      description: p.shortDesc,
      nuits_minimum: p.minNights,
    })),
  };
}

// --- GET PROPERTY DETAILS ---
async function getPropertyDetails(args: { slug: string }) {
  const property = await prisma.property.findUnique({
    where: { slug: args.slug },
    include: {
      reviews: {
        select: { rating: true, comment: true },
        take: 3,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!property) return { error: 'Bien non trouvé' };

  const avgRating = property.reviews.length > 0
    ? (property.reviews.reduce((a, b) => a + b.rating, 0) / property.reviews.length).toFixed(1)
    : 'Pas encore noté';

  return {
    nom: property.name,
    slug: property.slug,
    type: property.type,
    quartier: property.district,
    adresse: property.address,
    description: property.description,
    chambres: property.bedrooms,
    salles_de_bain: property.bathrooms,
    capacite: property.capacity,
    surface: `${property.surface}m²`,
    equipements: property.amenities,
    prix_basse_saison: `${property.priceLowSeason} MAD/nuit`,
    prix_haute_saison: `${property.priceHighSeason} MAD/nuit`,
    frais_menage: `${property.cleaningFee} MAD`,
    nuits_minimum: property.minNights,
    note_moyenne: avgRating,
    nombre_avis: property.reviews.length,
    derniers_avis: property.reviews.map((r) => ({
      note: r.rating,
      commentaire: r.comment,
    })),
  };
}

// --- SEARCH EXTRAS ---
async function searchExtras(args: { category?: string; max_budget?: number }) {
  const where: any = { available: true };

  if (args.category) where.category = args.category;
  if (args.max_budget) where.price = { lte: args.max_budget };

  const extras = await prisma.extra.findMany({
    where,
    select: {
      name: true,
      category: true,
      description: true,
      price: true,
      priceUnit: true,
      duration: true,
      maxPersons: true,
    },
    orderBy: { sortOrder: 'asc' },
  });

  if (extras.length === 0) {
    return { message: 'Aucune expérience trouvée pour ces critères.', count: 0, extras: [] };
  }

  return {
    count: extras.length,
    extras: extras.map((e) => ({
      nom: e.name,
      categorie: e.category,
      description: e.description,
      prix: `${e.price} MAD/${e.priceUnit}`,
      duree: e.duration,
      max_personnes: e.maxPersons,
    })),
  };
}

// --- SEARCH KNOWLEDGE ---
async function searchKnowledge(args: { query: string; category?: string }) {
  const where: any = {};

  if (args.category) where.category = args.category;

  // Recherche fulltext MySQL
  const results = await prisma.knowledgeBase.findMany({
    where: {
      ...where,
      OR: [
        { title: { contains: args.query } },
        { content: { contains: args.query } },
      ],
    },
    select: {
      title: true,
      content: true,
      category: true,
    },
    take: 3,
  });

  if (results.length === 0) {
    // Fallback : chercher par catégorie seule
    const fallback = await prisma.knowledgeBase.findMany({
      where: args.category ? { category: args.category } : {},
      select: { title: true, content: true, category: true },
      take: 3,
    });
    return { results: fallback };
  }

  return { results };
}