import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../config/database';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Dossier de destination
const uploadDir = path.join(__dirname, '../../../frontend/public/images/uploads');

// Créer le dossier s'il n'existe pas
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Config multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = file.originalname
      .replace(ext, '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    cb(null, `${name}-${Date.now()}${ext}`);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format non supporté. Utilisez JPG, PNG ou WebP.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// POST /api/admin/upload — Upload une image
export async function uploadImage(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Aucun fichier envoyé' });
      return;
    }

    const publicPath = `/images/uploads/${req.file.filename}`;

    res.json({
      message: 'Image uploadée avec succès',
      path: publicPath,
      filename: req.file.filename,
      size: req.file.size,
    });
  } catch (error) {
    console.error('Erreur upload:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload' });
  }
}

// PUT /api/admin/properties/:id/photos — Mettre à jour les photos d'un bien
export async function updatePropertyPhotos(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const { coverPhoto, photos } = req.body;

    const property = await prisma.property.update({
      where: { id },

      data: {
        ...(coverPhoto !== undefined && { coverPhoto }),
        ...(photos !== undefined && { photos }),
      },
      select: { id: true, name: true, coverPhoto: true, photos: true },
    });

    res.json({ message: 'Photos mises à jour', property });
  } catch (error) {
    console.error('Erreur updatePropertyPhotos:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// PUT /api/admin/extras/:id/photo — Mettre à jour la photo d'un extra
export async function updateExtraPhoto(req: AuthRequest, res: Response): Promise<void> {
  try {
  const id = req.params.id as string;
    const { photo } = req.body;

    const extra = await prisma.extra.update({
      where: { id },
      data: { photo },
      select: { id: true, name: true, photo: true },
    });

    res.json({ message: 'Photo mise à jour', extra });
  } catch (error) {
    console.error('Erreur updateExtraPhoto:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// GET /api/admin/media — Lister toutes les images uploadées
export async function listMedia(req: AuthRequest, res: Response): Promise<void> {
  try {
    const uploadsDir = path.join(__dirname, '../../../frontend/public/images/uploads');
    const imagesDir = path.join(__dirname, '../../../frontend/public/images');

    const files: { path: string; name: string; folder: string }[] = [];

    // Images uploadées
    if (fs.existsSync(uploadsDir)) {
      fs.readdirSync(uploadsDir).forEach((f) => {
        if (/\.(jpg|jpeg|png|webp)$/i.test(f)) {
          files.push({ path: `/images/uploads/${f}`, name: f, folder: 'uploads' });
        }
      });
    }

    // Images existantes (racine)
    fs.readdirSync(imagesDir).forEach((f) => {
      if (/\.(jpg|jpeg|png|webp)$/i.test(f)) {
        files.push({ path: `/images/${f}`, name: f, folder: 'images' });
      }
    });

    // Images biens
    const biensDir = path.join(imagesDir, 'biens');
    if (fs.existsSync(biensDir)) {
      fs.readdirSync(biensDir).forEach((f) => {
        if (/\.(jpg|jpeg|png|webp)$/i.test(f)) {
          files.push({ path: `/images/biens/${f}`, name: f, folder: 'biens' });
        }
      });
    }

    // Images extras
    const extrasDir = path.join(imagesDir, 'extras');
    if (fs.existsSync(extrasDir)) {
      fs.readdirSync(extrasDir).forEach((f) => {
        if (/\.(jpg|jpeg|png|webp)$/i.test(f)) {
          files.push({ path: `/images/extras/${f}`, name: f, folder: 'extras' });
        }
      });
    }

    // Propriétés avec photos
    const properties = await prisma.property.findMany({
      select: { id: true, name: true, slug: true, coverPhoto: true, photos: true },
      orderBy: { name: 'asc' },
    });

    // Extras avec photos
    const extras = await prisma.extra.findMany({
      select: { id: true, name: true, category: true, photo: true },
      orderBy: { sortOrder: 'asc' },
    });

    res.json({ files, properties, extras });
  } catch (error) {
    console.error('Erreur listMedia:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}