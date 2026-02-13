import { Router } from 'express';
import { submitProperty, submitService } from '../controllers/invest.controller';

const router = Router();

router.post('/property', submitProperty);
router.post('/service', submitService);

export default router;