import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Routes publiques
router.post('/register', register);
router.post('/login', login);

// Route protégée (nécessite un token)
router.get('/me', authenticate, getMe);

export default router;