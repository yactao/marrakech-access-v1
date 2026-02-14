import { Router } from 'express';
import {
  getAdminStats,
  updatePropertyStatus,
  updateBookingStatus,
  updateTicketStatus,
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { upload, uploadImage, updatePropertyPhotos, updateExtraPhoto, listMedia } from '../controllers/upload.controller';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/stats', getAdminStats);
router.put('/properties/:id/status', updatePropertyStatus);
router.put('/bookings/:id/status', updateBookingStatus);
router.put('/tickets/:id/status', updateTicketStatus);
router.get('/media', listMedia);
router.post('/upload', upload.single('image'), uploadImage);
router.put('/properties/:id/photos', updatePropertyPhotos);
router.put('/extras/:id/photo', updateExtraPhoto);

export default router;
