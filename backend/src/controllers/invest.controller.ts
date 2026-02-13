import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

// Schéma de validation — soumission de bien
const propertySubmissionSchema = z.object({
  // Infos propriétaire
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Téléphone requis'),
  password: z.string().min(6, 'Mot de passe min 6 caractères'),

  // Infos bien
  propertyName: z.string().min(2, 'Nom du bien requis'),
  propertyType: z.enum(['VILLA', 'RIAD', 'APPARTEMENT', 'DAR', 'SUITE']),
  district: z.string().min(1, 'Quartier requis'),
  address: z.string().optional(),
  bedrooms: z.number().min(1, 'Au moins 1 chambre'),
  bathrooms: z.number().min(1, 'Au moins 1 salle de bain'),
  capacity: z.number().min(1, 'Au moins 1 voyageur'),
  surface: z.number().min(10, 'Surface minimum 10m²'),
  description: z.string().min(20, 'Description min 20 caractères'),
  amenities: z.array(z.string()).optional(),
  pricePerNight: z.number().min(100, 'Prix minimum 100 MAD'),
  message: z.string().optional(),
});

// Schéma — soumission de service premium
const serviceSubmissionSchema = z.object({
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Téléphone requis'),
  password: z.string().min(6, 'Mot de passe min 6 caractères'),

  serviceName: z.string().min(2, 'Nom du service requis'),
  category: z.enum(['culinaire', 'bien-etre', 'excursion', 'transport', 'loisir']),
  description: z.string().min(20, 'Description min 20 caractères'),
  price: z.number().min(50, 'Prix minimum 50 MAD'),
  priceUnit: z.string().min(1, 'Unité de prix requise'),
  duration: z.string().optional(),
  maxPersons: z.number().optional(),
  message: z.string().optional(),
});

// POST /api/invest/property — Soumettre un bien
export async function submitProperty(req: Request, res: Response): Promise<void> {
  try {
    const data = propertySubmissionSchema.parse(req.body);

    // 1. Vérifier si l'email existe déjà
    let user = await prisma.user.findUnique({ where: { email: data.email } });

    if (!user) {
      // Créer le compte propriétaire
      const passwordHash = await bcrypt.hash(data.password, 12);
      user = await prisma.user.create({
        data: {
          email: data.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          role: 'OWNER',
        },
      });
    } else if (user.role === 'GUEST') {
      // Upgrader en OWNER
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'OWNER', phone: data.phone || user.phone },
      });
    }

    // 2. Générer un slug unique
    const baseSlug = data.propertyName
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    // 3. Créer le bien en statut PENDING (en attente de validation admin)
    const property = await prisma.property.create({
      data: {
        ownerId: user.id,
        name: data.propertyName,
        slug,
        type: data.propertyType,
        description: data.description,
        shortDesc: data.description.substring(0, 200),
        district: data.district,
        address: data.address || '',
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        capacity: data.capacity,
        surface: data.surface,
        amenities: data.amenities || [],
        priceLowSeason: data.pricePerNight,
        priceHighSeason: Math.round(data.pricePerNight * 1.4),
        cleaningFee: Math.round(data.pricePerNight * 0.1),
        status: 'PENDING',
      },
    });

    // 4. Créer un ticket pour l'admin
    await prisma.ticket.create({
      data: {
        creatorId: user.id,
        type: 'nouveau_bien',
        subject: `Nouveau bien soumis : ${data.propertyName}`,
        priority: 'MEDIUM',
        status: 'OPEN',
        messages: JSON.parse(JSON.stringify([{
          date: new Date().toISOString(),
          from: `${data.firstName} ${data.lastName}`,
          text: data.message || `Je souhaite référencer mon bien "${data.propertyName}" (${data.propertyType}) situé à ${data.district} sur votre plateforme.`,
        }])),
      },
    });

    res.status(201).json({
      message: 'Votre bien a été soumis avec succès ! Notre équipe va l\'examiner sous 48h.',
      propertyId: property.id,
      propertySlug: property.slug,
      status: 'PENDING',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Données invalides', details: error.errors });
      return;
    }
    console.error('Erreur submitProperty:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// POST /api/invest/service — Soumettre un service premium
export async function submitService(req: Request, res: Response): Promise<void> {
  try {
    const data = serviceSubmissionSchema.parse(req.body);

    // 1. Créer ou trouver le user
    let user = await prisma.user.findUnique({ where: { email: data.email } });

    if (!user) {
      const passwordHash = await bcrypt.hash(data.password, 12);
      user = await prisma.user.create({
        data: {
          email: data.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          role: 'OWNER',
        },
      });
    }

    // 2. Créer l'extra en indisponible (en attente de validation)
    const extra = await prisma.extra.create({
      data: {
        name: data.serviceName,
        category: data.category,
        description: data.description,
        price: data.price,
        priceUnit: data.priceUnit,
        duration: data.duration || null,
        maxPersons: data.maxPersons || null,
        available: false, // Pas visible tant que non validé par l'admin
      },
    });

    // 3. Créer un ticket pour l'admin
    await prisma.ticket.create({
      data: {
        creatorId: user.id,
        type: 'nouveau_service',
        subject: `Nouveau service soumis : ${data.serviceName}`,
        priority: 'MEDIUM',
        status: 'OPEN',
        messages: JSON.parse(JSON.stringify([{
          date: new Date().toISOString(),
          from: `${data.firstName} ${data.lastName}`,
          text: data.message || `Je propose mon service "${data.serviceName}" (${data.category}) à ${data.price} MAD/${data.priceUnit}.`,
        }])),
      },
    });

    res.status(201).json({
      message: 'Votre service a été soumis avec succès ! Notre équipe va l\'examiner sous 48h.',
      extraId: extra.id,
      status: 'en_attente',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Données invalides', details: error.errors });
      return;
    }
    console.error('Erreur submitService:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}