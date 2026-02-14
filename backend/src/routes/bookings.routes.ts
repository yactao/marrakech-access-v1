import { Router } from 'express';
import { createBooking, getMyBookings } from '../controllers/bookings.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', createBooking);
router.get('/my', getMyBookings);

export default router;