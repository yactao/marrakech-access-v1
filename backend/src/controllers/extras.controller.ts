import { Request, Response } from 'express';
import { prisma } from '../config/database';

// GET /api/extras — Liste avec filtre par catégorie
export async function listExtras(req: Request, res: Response): Promise<void> {
  try {
    const { category, maxBudget } = req.query;

    const where: any = {
      available: true,
    };

    if (category) {
      where.category = category as string;
    }

    if (maxBudget) {
      where.price = { lte: parseFloat(maxBudget as string) };
    }

    const extras = await prisma.extra.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        price: true,
        priceUnit: true,
        duration: true,
        maxPersons: true,
        photo: true,
      },
    });

    // Grouper par catégorie
    const categories = [...new Set(extras.map((e) => e.category))];
    const grouped = categories.map((cat) => ({
      category: cat,
      label: getCategoryLabel(cat),
      extras: extras.filter((e) => e.category === cat),
    }));

    res.json({
      extras,
      grouped,
      categories: categories.map((c) => ({ id: c, label: getCategoryLabel(c) })),
    });
  } catch (error) {
    console.error('Erreur listExtras:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// GET /api/extras/:id — Détail d'un extra
export async function getExtra(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const idString = Array.isArray(id) ? id[0] : id;

    const extra = await prisma.extra.findUnique({
      where: { id: idString },
    });

    if (!extra || !extra.available) {
      res.status(404).json({ error: 'Extra non trouvé' });
      return;
    }

    res.json({ extra });
  } catch (error) {
    console.error('Erreur getExtra:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// Helper : labels français des catégories
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'culinaire': '🍽️ Culinaire',
    'bien-etre': '🧖 Bien-être',
    'excursion': '🏔️ Excursions',
    'transport': '🚗 Transport',
    'loisir': '🎭 Loisirs',
  };
  return labels[category] || category;
}