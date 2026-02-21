import { Router } from 'express';
import { register, login, refresh, logout, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Routes publiques (avec rate limiting anti brute-force)
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// Renouvellement du token via refresh token (cookie httpOnly)
router.post('/refresh', refresh);

// Déconnexion (efface les cookies)
router.post('/logout', logout);

// Route protégée
router.get('/me', authenticate, getMe);

export default router;
