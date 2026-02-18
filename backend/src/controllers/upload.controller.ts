import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../config/database';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// ✅ FIX BONUS — Clés Cloudinary via variables d'environnement UNIQUEMENT
// Plus jamais de credentials en dur dans le code source.
// Ajoutez dans Railway : CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Vérification au démarrage
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Variables Cloudinary manquantes : CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
  // On ne crash pas le serveur — l'upload sera simplement indisponible
}

// Config multer (stockage en mémoire pour Cloudinary)
const storage = multer.memoryStorage();

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

// Upload vers Cloudinary
const uploadToCloudinary = (buffer: Buffer, folder: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `marrakech-access/${folder}`,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 800, crop: 'limit', quality: 'auto' },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// POST /api/admin/upload — Upload une image vers Cloudinary
export async function uploadImage(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Aucun fichier envoyé' });
      return;
    }

    if (!process.env.CLOUDINARY_API_KEY) {
      res.status(503).json({ error: 'Service d\'upload temporairement indisponible (configuration manquante).' });
      return;
    }

    const folder = req.body.folder || 'uploads';
    const result = await uploadToCloudinary(req.file.buffer, folder);

    res.json({
      message: 'Image uploadée avec succès',
      path: result.secure_url,
      publicId: result.public_id,
      filename: req.file.originalname,
      size: req.file.size,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error('Erreur upload Cloudinary:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload' });
  }
}

// PUT /api/admin/properties/:id/photos — Mettre à jour les photos d'un bien
export async function updatePropertyPhotos(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const { photos, coverPhoto } = req.body;

    const property = await prisma.property.update({
      where: { id },
      data: {
        photos: photos || [],
        coverPhoto: coverPhoto || null,
      },
    });

    res.json({ message: 'Photos mises à jour', property });
  } catch (error) {
    console.error('Erreur updatePropertyPhotos:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// PUT /api/admin/extras/:id/photo
export async function updateExtraPhoto(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const { photo } = req.body;

    const extra = await prisma.extra.update({
      where: { id },
      data: { photo },
    });

    res.json({ message: 'Photo mise à jour', extra });
  } catch (error) {
    console.error('Erreur updateExtraPhoto:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// GET /api/admin/media — Lister les médias Cloudinary ET les données pour l'admin
export async function listMedia(req: AuthRequest, res: Response): Promise<void> {
  try {
    // 1. Récupérer les images depuis Cloudinary
    let media = [];
    if (process.env.CLOUDINARY_API_KEY) {
      try {
        const result = await cloudinary.api.resources({
          type: 'upload',
          prefix: 'marrakech-access/', // Assurez-vous que c'est le bon dossier
          max_results: 100,
        });

        media = result.resources.map((r: any) => ({
          publicId: r.public_id,
          url: r.secure_url,
          format: r.format,
          width: r.width,
          height: r.height,
          size: r.bytes,
          createdAt: r.created_at,
          // Mapping pour que le frontend s'y retrouve
          path: r.secure_url, 
          name: r.public_id.split('/').pop(),
          folder: r.folder || 'cloudinary'
        }));
      } catch (cloudError) {
        console.error("Erreur Cloudinary (ignorée pour ne pas bloquer l'admin):", cloudError);
      }
    }

    // 2. Récupérer les Propriétés (pour les listes déroulantes)
    const properties = await prisma.property.findMany({
      select: {
        id: true,
        name: true,
        coverPhoto: true,
        photos: true,
      },
      orderBy: { name: 'asc' }
    });

    // 3. Récupérer les Extras (pour les listes déroulantes)
    const extras = await prisma.extra.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        photo: true,
      },
      orderBy: { name: 'asc' }
    });

    // 4. Renvoyer le TOUT en un seul objet JSON
    res.json({
      files: media,        // Le frontend attend 'files'
      properties: properties,
      extras: extras,
      total: media.length
    });

  } catch (error) {
    console.error('Erreur listMedia:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des médias' });
  }
}