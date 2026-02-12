import { Router, Request, Response } from 'express';
import { chat } from '../services/ai/majordome.service';

const router = Router();

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, conversationId } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ error: 'Message requis' });
      return;
    }

    // Extraire le userId du token si présent (optionnel pour le chat)
    let userId: string | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const { env } = require('../config/env');
        const decoded = jwt.verify(authHeader.split(' ')[1], env.JWT_SECRET) as any;
        userId = decoded.id;
      } catch {
        // Token invalide — on continue en anonyme
      }
    }

    const result = await chat(message, conversationId || null, userId);

    res.json({
      reply: result.reply,
      conversationId: result.conversationId,
    });
  } catch (error: any) {
    console.error('❌ Erreur chat:', error.message);
    res.status(500).json({
      error: 'Le Majordome est momentanément indisponible.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;
