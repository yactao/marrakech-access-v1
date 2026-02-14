import { Response } from 'express';
import { prisma } from '../config/database'; // Assurez-vous que le chemin est bon
import { AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';

const createBookingSchema = z.object({
  propertyId: z.string(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guestsCount: z.number().min(1),
  extras: z.array(z.object({
    extraId: z.string(),
    quantity: z.number().min(1),
    date: z.string().optional(), // Optionnel dans le JSON, mais on mettra une valeur par défaut pour la BDD
  })).optional(),
  specialRequests: z.string().optional(),
});

// POST /api/bookings
export async function createBooking(req: AuthRequest, res: Response): Promise<void> {
  try {
    const data = createBookingSchema.parse(req.body);
    const userId = req.user!.id;

    // 1. Récupérer la propriété
    const property = await prisma.property.findUnique({
      where: { id: data.propertyId },
    });

    if (!property || property.status !== 'ACTIVE') {
      res.status(400).json({ error: "Ce bien n'est pas disponible à la réservation" });
      return;
    }

    // 2. Calculer les nuits
    const checkIn = new Date(data.checkIn);
    const checkOut = new Date(data.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    if (nights < property.minNights) {
      res.status(400).json({ error: `Séjour minimum de ${property.minNights} nuit(s) requis` });
      return;
    }

    if (data.guestsCount > property.capacity) {
      res.status(400).json({ error: `Capacité maximum : ${property.capacity} voyageurs` });
      return;
    }

    // 3. Vérifier la disponibilité
    const overlapping = await prisma.booking.findFirst({
      where: {
        propertyId: data.propertyId,
        status: { in: ['CONFIRMED', 'PENDING'] }, // J'ai retiré CHECKED_IN si ce n'est pas dans l'enum, ajustez selon votre enum BookingStatus
        OR: [
          { checkIn: { lt: checkOut }, checkOut: { gt: checkIn } },
        ],
      },
    });

    if (overlapping) {
      res.status(409).json({ error: 'Ce bien est déjà réservé pour ces dates' });
      return;
    }

    // 4. Calculs financiers
    const month = checkIn.getMonth() + 1;
    const isHighSeason = [3, 4, 5, 10, 11, 12].includes(month);
    
    // Conversion en Number pour les calculs JS
    const pricePerNight = isHighSeason 
      ? Number(property.priceHighSeason) 
      : Number(property.priceLowSeason);

    // DANS LE SCHEMA : c'est 'subtotal' qui correspond au prix des nuits
    const accommodationTotal = pricePerNight * nights; 
    const cleaningFee = Number(property.cleaningFee);

    // 5. Calculer les extras
    let extrasTotal = 0;
    const extrasToCreate: any[] = []; // On utilise any[] temporairement pour faciliter la construction pour Prisma

    if (data.extras && data.extras.length > 0) {
      const extraIds = data.extras.map((e) => e.extraId);
      const dbExtras = await prisma.extra.findMany({
        where: { id: { in: extraIds }, available: true },
      });

      for (const item of data.extras) {
        const extra = dbExtras.find((e) => e.id === item.extraId);
        if (extra) {
          const unitPrice = Number(extra.price);
          const subtotalExtra = unitPrice * item.quantity;
          
          extrasTotal += subtotalExtra;

          // Note importante : Votre schéma OBLIGE une date pour l'extra.
          // Si l'utilisateur n'en donne pas, on met la date de Check-in par défaut.
          const extraDate = item.date ? new Date(item.date) : checkIn;

          extrasToCreate.push({
            extra: { connect: { id: extra.id } }, // Liaison correcte via connect
            quantity: item.quantity,
            unitPrice: unitPrice,     // Requis par votre schéma BookingExtra
            subtotal: subtotalExtra,  // Requis par votre schéma BookingExtra
            date: extraDate,          // Requis par votre schéma BookingExtra (pas de null !)
          });
        }
      }
    }

    // 6. Calcul du total final
    const totalAmount = accommodationTotal + cleaningFee + extrasTotal;

    // 7. Création de la réservation
    const booking = await prisma.booking.create({
      data: {
        guestId: userId,
        propertyId: data.propertyId,
        checkIn,
        checkOut,
        nights,
        guestsCount: data.guestsCount,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        
        // --- MAPPING DES CHAMPS FINANCIERS ---
        pricePerNight,       
        subtotal: accommodationTotal, // Correction: accommodationTotal -> subtotal (selon schema)
        cleaningFee,
        extrasTotal,
        totalAmount,
        serviceFee: 0, // Valeur par défaut explicite (optionnel car @default(0) dans schema)

        // --- MAPPING DES TEXTES ---
        guestMessage: data.specialRequests || null, // Correction: specialRequests -> guestMessage (selon schema)

        // --- CREATION DES EXTRAS ---
        extras: {
          create: extrasToCreate,
        },
      },
      include: {
        property: { select: { name: true, slug: true, district: true } },
        extras: {
          include: { extra: { select: { name: true, category: true } } },
        },
      },
    });

    // 8. Réponse
    res.status(201).json({
      message: 'Réservation créée avec succès !',
      booking: {
        id: booking.id,
        property: booking.property,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        nights: booking.nights,
        totalAmount: booking.totalAmount,
        status: booking.status,
        extras: booking.extras.map((e) => ({
          name: e.extra.name,
          quantity: e.quantity,
          price: e.unitPrice,
          date: e.date
        })),
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Données invalides', details: error.errors });
      return;
    }
    console.error('Erreur createBooking:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// GET /api/bookings/my — Réservations du client connecté
export async function getMyBookings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;

    const bookings = await prisma.booking.findMany({
      where: { guestId: userId },
      include: {
        property: { select: { name: true, slug: true, district: true, type: true, coverPhoto: true } },
        extras: {
          include: { extra: { select: { name: true, category: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ bookings });
  } catch (error) {
    console.error('Erreur getMyBookings:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}