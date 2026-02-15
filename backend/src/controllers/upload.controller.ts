import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../config/database';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dskvolthd',
  api_key: process.env.CLOUDINARY_API_KEY || '295977787385832',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'oceveUjYuj2xw_yxxb4B3V7u2oA',
});

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
          { width: 1200, height: 800, crop: 'limit', quality: 'auto' }
        ]
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

// GET /api/admin/media — Lister les images (depuis Cloudinary + DB)
export async function listMedia(req: AuthRequest, res: Response): Promise<void> {
  try {
    // Récupérer les images depuis Cloudinary
    let cloudinaryFiles: { path: string; name: string; folder: string; publicId: string }[] = [];
    
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'marrakech-access/',
        max_results: 100,
      });
      
      cloudinaryFiles = result.resources.map((r: any) => ({
        path: r.secure_url,
        name: r.public_id.split('/').pop() || r.public_id,
        folder: r.folder || 'uploads',
        publicId: r.public_id,
      }));
    } catch (e) {
      console.log('Cloudinary listing skipped:', e);
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

    res.json({ files: cloudinaryFiles, properties, extras });
  } catch (error) {
    console.error('Erreur listMedia:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// DELETE /api/admin/media/:publicId — Supprimer une image de Cloudinary
export async function deleteMedia(req: AuthRequest, res: Response): Promise<void> {
  try {
    const publicId = req.params.publicId as string;
    
    if (!publicId) {
      res.status(400).json({ error: 'publicId requis' });
      return;
    }
    
    await cloudinary.uploader.destroy(publicId);
    
    res.json({ message: 'Image supprimée' });
  } catch (error) {
    console.error('Erreur deleteMedia:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
