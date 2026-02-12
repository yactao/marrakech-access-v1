import { Router } from 'express';
import { getOwnerStats, getOwnerBookings } from '../controllers/owner.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(authorize('OWNER', 'ADMIN'));

router.get('/stats', getOwnerStats);
router.get('/bookings', getOwnerBookings);

export default router;