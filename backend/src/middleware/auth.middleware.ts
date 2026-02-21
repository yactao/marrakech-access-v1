import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

// Étend le type Request pour y ajouter l'utilisateur connecté
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Middleware : vérifie le token JWT (cookie httpOnly en priorité, sinon Authorization header)
export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  // 1. Lire depuis le cookie httpOnly (priorité)
  // 2. Fallback sur le header Authorization: Bearer <token>
  const token =
    req.cookies?.access_token ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null);

  if (!token) {
    res.status(401).json({ error: 'Token manquant. Connectez-vous.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide ou expiré.' });
  }
}

// Middleware : vérifie le rôle (à utiliser APRÈS authenticate)
export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Non authentifié.' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Accès interdit. Rôle insuffisant.' });
      return;
    }
    next();
  };
}
