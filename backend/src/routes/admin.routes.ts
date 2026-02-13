import { Router } from 'express';
import {
  getAdminStats,
  updatePropertyStatus,
  updateBookingStatus,
  updateTicketStatus,
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/stats', getAdminStats);
router.put('/properties/:id/status', updatePropertyStatus);
router.put('/bookings/:id/status', updateBookingStatus);
router.put('/tickets/:id/status', updateTicketStatus);

export default router;