import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import propertiesRoutes from './routes/properties.routes';
import extrasRoutes from './routes/extras.routes';
import chatRoutes from './routes/chat.routes';
import ownerRoutes from './routes/owner.routes';
import adminRoutes from './routes/admin.routes';
import investRoutes from './routes/invest.routes';
import bookingsRoutes from './routes/bookings.routes';
import { globalLimiter } from './middleware/rateLimiter';
import { env } from './config/env';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS - liste blanche des origines autorisées
app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (curl, apps mobiles, etc.)
    if (!origin) return callback(null, true);
    if (env.ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`Origine non autorisée par la politique CORS : ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting global
app.use(globalLimiter);

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

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route non trouvée',
    message: `La route ${_req.method} ${_req.originalUrl} n'existe pas.`,
  });
});

// Gestionnaire d'erreurs global avec logs structurés
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  const status = (err as any).status || 500;
  const isClientError = status < 500;

  // Log structuré : timestamp, méthode, chemin, status, message
  const logLevel = isClientError ? 'WARN' : 'ERROR';
  console.error(
    `[${new Date().toISOString()}] ${logLevel} ${req.method} ${req.originalUrl} → ${status} | ${err.message}`
  );
  if (!isClientError && env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  res.status(status).json({
    error: isClientError ? err.message : 'Erreur serveur interne',
    message: env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue.',
  });
});

export default app;
