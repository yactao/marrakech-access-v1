import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import propertiesRoutes from './routes/properties.routes';
import extrasRoutes from './routes/extras.routes';
import chatRoutes from './routes/chat.routes';
import ownerRoutes from './routes/owner.routes';
import adminRoutes from './routes/admin.routes';
import investRoutes from './routes/invest.routes';
import bookingsRoutes from './routes/bookings.routes';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ FIX #1 — CORS restreint aux origines autorisées
// En dev : localhost est autorisé. En prod : uniquement le domaine Vercel.
// Pour ajouter un domaine, modifiez ALLOWED_ORIGINS dans les variables d'env Railway.
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://marrakech-access.vercel.app',
      'https://www.marrakech-acces.com/',

    ];

app.use(
  cors({
    origin: (origin, callback) => {
      // Autoriser les requêtes sans origin (curl, Postman, apps mobiles)
      if (!origin) return callback(null, true);

      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`🚫 CORS bloqué pour l'origine : ${origin}`);
      return callback(new Error(`Origine non autorisée par CORS : ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Health check endpoints
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    service: 'Marrakech Access API',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()) + 's',
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/extras', extrasRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/invest', investRoutes);
app.use('/api/bookings', bookingsRoutes);

// 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route non trouvée',
    message: `La route ${_req.method} ${_req.originalUrl} n'existe pas.`,
  });
});

// Gestionnaire d'erreurs global
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // Erreur CORS — message propre pour le client
  if (err.message.startsWith('Origine non autorisée')) {
    res.status(403).json({ error: err.message });
    return;
  }
  console.error('💥 Erreur serveur :', err.message);
  res.status(500).json({
    error: 'Erreur serveur interne',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue.',
  });
});

export default app;