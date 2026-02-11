import { Request, Response } from 'express';
import { prisma } from '../config/database';

// GET /api/properties — Liste avec filtres
export async function listProperties(req: Request, res: Response): Promise<void> {
  try {
    const {
      district,
      type,
      minBudget,
      maxBudget,
      minCapacity,
      bedrooms,
      amenities,
      search,
      sortBy = 'price_asc',
      page = '1',
      limit = '12',
    } = req.query;

    // Construction du filtre Prisma
    const where: any = {
      status: 'ACTIVE',
    };

   if (district) {
      where.district = district as string;
    }

    if (type) {
      where.type = type as string;
    }

    if (minBudget || maxBudget) {
      where.priceLowSeason = {};
      if (minBudget) where.priceLowSeason.gte = parseFloat(minBudget as string);
      if (maxBudget) where.priceLowSeason.lte = parseFloat(maxBudget as string);
    }

    if (minCapacity) {
      where.capacity = { gte: parseInt(minCapacity as string) };
    }

    if (bedrooms) {
      where.bedrooms = { gte: parseInt(bedrooms as string) };
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } },
        { district: { contains: search as string } },
      ];
    }

    // Tri
    let orderBy: any = {};
    switch (sortBy) {
      case 'price_asc':
        orderBy = { priceLowSeason: 'asc' };
        break;
      case 'price_desc':
        orderBy = { priceLowSeason: 'desc' };
        break;
      case 'capacity_desc':
        orderBy = { capacity: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      default:
        orderBy = { priceLowSeason: 'asc' };
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    // Requête
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          shortDesc: true,
          district: true,
          bedrooms: true,
          bathrooms: true,
          capacity: true,
          surface: true,
          amenities: true,
          priceLowSeason: true,
          priceHighSeason: true,
          currency: true,
          minNights: true,
          coverPhoto: true,
          photos: true,
          reviews: {
            select: { rating: true },
          },
        },
      }),
      prisma.property.count({ where }),
    ]);

    // Calcul note moyenne par propriété
    const propertiesWithRating = properties.map((p) => {
      const ratings = p.reviews.map((r) => r.rating);
      const avgRating = ratings.length > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        : null;
      const { reviews, ...rest } = p;
      return { ...rest, avgRating, reviewsCount: ratings.length };
    });

    res.json({
      properties: propertiesWithRating,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Erreur listProperties:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// GET /api/properties/districts — Liste des quartiers disponibles
export async function listDistricts(req: Request, res: Response): Promise<void> {
  try {
    const districts = await prisma.property.findMany({
      where: { status: 'ACTIVE' },
      select: { district: true },
      distinct: ['district'],
      orderBy: { district: 'asc' },
    });

    res.json({
      districts: districts.map((d) => d.district),
    });
  } catch (error) {
    console.error('Erreur listDistricts:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// GET /api/properties/:slug — Fiche détaillée
export async function getProperty(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;

    const property = await prisma.property.findUnique({
      where: { slug: slug as string },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            createdAt: true,
          },
        },
        reviews: {
          include: {
            author: {
              select: { firstName: true, lastName: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        seasons: {
          orderBy: { startDate: 'asc' },
        },
        availability: {
          where: {
            date: { gte: new Date() },
            available: false,
          },
          select: { date: true, source: true },
        },
      },
    });

    if (!property) {
      res.status(404).json({ error: 'Propriété non trouvée' });
      return;
    }

    if (property.status !== 'ACTIVE') {
      res.status(404).json({ error: 'Propriété non disponible' });
      return;
    }

    // Calcul note moyenne
    const ratings = property.reviews.map((r) => r.rating);
    const avgRating = ratings.length > 0
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : null;

    // Dates indisponibles (pour le calendrier)
    const unavailableDates = property.availability.map((a) => a.date.toISOString().split('T')[0]);

    res.json({
      property: {
        ...property,
        avgRating,
        reviewsCount: ratings.length,
        unavailableDates,
      },
    });
  } catch (error) {
    console.error('Erreur getProperty:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}