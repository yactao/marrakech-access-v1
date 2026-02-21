import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { chat } from '../services/ai/majordome.service';
import { chatLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/', chatLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, conversationId } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ error: 'Message requis' });
      return;
    }

    // Extraire le userId du token si présent (optionnel pour le chat)
    // Priorité : cookie httpOnly, puis Authorization header
    let userId: string | null = null;
    const rawToken =
      req.cookies?.access_token ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (rawToken) {
      try {
        const decoded = jwt.verify(rawToken, env.JWT_SECRET) as any;
        userId = decoded.id;
      } catch {
        // Token invalide — on continue en anonyme
      }
    }

    const result = await chat(message, conversationId || null, userId);

    res.json({
      reply: result.reply,
      conversationId: result.conversationId,
      cards: result.cards || [],
    });
  } catch (error: any) {
    console.error('❌ Erreur chat:', error.message);
    res.status(500).json({
      error: 'Le Majordome est momentanément indisponible.',
      details: env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;
