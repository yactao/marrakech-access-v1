import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { AuthRequest } from '../middleware/auth.middleware';

// Schéma de validation pour l'inscription
const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit faire au moins 6 caractères'),
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  phone: z.string().optional(),
  role: z.enum(['GUEST', 'OWNER']).optional(),
});

// Schéma de validation pour la connexion
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

// Génère un token JWT
function generateToken(user: { id: string; email: string; role: string }): string {
  const payload = { id: user.id, email: user.email, role: user.role };
  const secret = env.JWT_SECRET;
  const options: jwt.SignOptions = { expiresIn: env.JWT_EXPIRES_IN as any };
  return jwt.sign(payload, secret, options);
}

// POST /api/auth/register
export async function register(req: Request, res: Response): Promise<void> {
  try {
    // 1. Valider les données
    const data = registerSchema.parse(req.body);

    // 2. Vérifier si l'email existe déjà
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      res.status(409).json({ error: 'Cet email est déjà utilisé.' });
      return;
    }

    // 3. Hasher le mot de passe
    const passwordHash = await bcrypt.hash(data.password, 12);

    // 4. Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        role: data.role || 'GUEST',
      },
    });

    // 5. Générer le token
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    // 6. Répondre
    res.status(201).json({
      message: 'Compte créé avec succès',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Données invalides', details: error.errors });
      return;
    }
    console.error('Erreur register:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// POST /api/auth/login
export async function login(req: Request, res: Response): Promise<void> {
  try {
    // 1. Valider
    const data = loginSchema.parse(req.body);

    // 2. Chercher l'utilisateur
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
      return;
    }

    // 3. Vérifier le mot de passe
    const validPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!validPassword) {
      res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
      return;
    }

    // 4. Générer le token
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    // 5. Répondre
    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Données invalides', details: error.errors });
      return;
    }
    console.error('Erreur login:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// GET /api/auth/me (route protégée)
export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        lang: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Erreur getMe:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}