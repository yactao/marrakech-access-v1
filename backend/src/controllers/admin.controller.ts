import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

// GET /api/admin/stats
export async function getAdminStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const [
      usersCount,
      propertiesCount,
      bookingsCount,
      extrasCount,
      ticketsCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.booking.count(),
      prisma.extra.count(),
      prisma.ticket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
    ]);

    const confirmedBookings = await prisma.booking.findMany({
      where: { status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] } },
      select: { totalAmount: true },
    });

    const totalRevenue = confirmedBookings.reduce(
      (sum, b) => sum + Number(b.totalAmount), 0
    );

    const recentBookings = await prisma.booking.findMany({
      include: {
        property: { select: { name: true, slug: true } },
        guest: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 15,
    });

    const recentUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const allProperties = await prisma.property.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        district: true,
        status: true,
        priceLowSeason: true,
        owner: { select: { firstName: true, lastName: true } },
        _count: { select: { bookings: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const openTickets = await prisma.ticket.findMany({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
      include: {
        creator: { select: { firstName: true, lastName: true } },
        booking: { select: { property: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      kpis: {
        totalRevenue,
        usersCount,
        propertiesCount,
        bookingsCount,
        extrasCount,
        openTickets: ticketsCount,
      },
      recentBookings,
      recentUsers,
      properties: allProperties,
      openTickets,
    });
  } catch (error) {
    console.error('Erreur getAdminStats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// PUT /api/admin/properties/:id/status
export async function updatePropertyStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { status } = req.body;

    const validStatuses = ['DRAFT', 'PENDING', 'ACTIVE', 'PAUSED', 'ARCHIVED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Statut invalide' });
      return;
    }

    const property = await prisma.property.update({
      where: { id },
      data: { status },
    });

    res.json({ message: 'Statut mis à jour', property });
  } catch (error) {
    console.error('Erreur updatePropertyStatus:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// PUT /api/admin/bookings/:id/status
export async function updateBookingStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Statut invalide' });
      return;
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    res.json({ message: 'Statut mis à jour', booking });
  } catch (error) {
    console.error('Erreur updateBookingStatus:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// PUT /api/admin/tickets/:id/status
export async function updateTicketStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Statut invalide' });
      return;
    }

    const updateData: any = { status };
    if (status === 'RESOLVED') updateData.resolvedAt = new Date();

    const ticket = await prisma.ticket.update({
      where: { id: typeof id === 'string' ? id : id[0] },
      data: updateData,
    });

    res.json({ message: 'Ticket mis à jour', ticket });
  } catch (error) {
    console.error('Erreur updateTicketStatus:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}