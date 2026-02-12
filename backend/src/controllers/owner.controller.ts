import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

// GET /api/owner/stats
export async function getOwnerStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const ownerId = req.user!.id;

    // Récupérer les propriétés du propriétaire
    const properties = await prisma.property.findMany({
      where: { ownerId },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        district: true,
        status: true,
        coverPhoto: true,
        priceLowSeason: true,
        bookings: {
          select: {
            id: true,
            checkIn: true,
            checkOut: true,
            nights: true,
            guestsCount: true,
            status: true,
            totalAmount: true,
            paymentStatus: true,
            createdAt: true,
            guest: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
          orderBy: { checkIn: 'desc' },
        },
        reviews: {
          select: { rating: true },
        },
      },
    });

    // Calcul des KPIs
    const allBookings = properties.flatMap((p) => p.bookings);
    const confirmedBookings = allBookings.filter((b) =>
      ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'].includes(b.status)
    );

    const totalRevenue = confirmedBookings.reduce(
      (sum, b) => sum + Number(b.totalAmount), 0
    );

    const totalNights = confirmedBookings.reduce(
      (sum, b) => sum + b.nights, 0
    );

    const allRatings = properties.flatMap((p) => p.reviews.map((r) => r.rating));
    const avgRating = allRatings.length > 0
      ? Math.round((allRatings.reduce((a, b) => a + b, 0) / allRatings.length) * 10) / 10
      : null;

    // Taux d'occupation (30 derniers jours)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentBookings = confirmedBookings.filter((b) => {
      const checkIn = new Date(b.checkIn);
      return checkIn >= thirtyDaysAgo && checkIn <= today;
    });
    const occupiedNights = recentBookings.reduce((sum, b) => sum + b.nights, 0);
    const totalPossibleNights = properties.length * 30;
    const occupancyRate = totalPossibleNights > 0
      ? Math.round((occupiedNights / totalPossibleNights) * 100)
      : 0;

    // Prochaines réservations
    const upcomingBookings = allBookings
      .filter((b) => new Date(b.checkIn) >= today && b.status !== 'CANCELLED')
      .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())
      .slice(0, 5);

    // Réservations récentes
    const recentBookingsList = allBookings
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    res.json({
      kpis: {
        totalRevenue,
        totalBookings: confirmedBookings.length,
        totalNights,
        avgRating,
        totalReviews: allRatings.length,
        occupancyRate,
        propertiesCount: properties.length,
      },
      properties: properties.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        type: p.type,
        district: p.district,
        status: p.status,
        coverPhoto: p.coverPhoto,
        priceLowSeason: p.priceLowSeason,
        bookingsCount: p.bookings.filter((b) => b.status !== 'CANCELLED').length,
        avgRating: p.reviews.length > 0
          ? Math.round((p.reviews.reduce((a, r) => a + r.rating, 0) / p.reviews.length) * 10) / 10
          : null,
      })),
      upcomingBookings,
      recentBookings: recentBookingsList,
    });
  } catch (error) {
    console.error('Erreur getOwnerStats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// GET /api/owner/bookings
export async function getOwnerBookings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const ownerId = req.user!.id;

    const bookings = await prisma.booking.findMany({
      where: {
        property: { ownerId },
      },
      include: {
        property: {
          select: { name: true, slug: true, type: true },
        },
        guest: {
          select: { firstName: true, lastName: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ bookings });
  } catch (error) {
    console.error('Erreur getOwnerBookings:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}