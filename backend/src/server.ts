import app from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';

// Error monitoring : capturer les erreurs non gérées avant qu'elles crashent le process
process.on('uncaughtException', (err: Error) => {
  console.error(`[${new Date().toISOString()}] UNCAUGHT EXCEPTION | ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  console.error(`[${new Date().toISOString()}] UNHANDLED REJECTION | ${message}`);
  if (reason instanceof Error) console.error(reason.stack);
  process.exit(1);
});

async function start(): Promise<void> {
  await connectDatabase();

  app.listen(env.PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║                                              ║');
    console.log('║   🏠  MARRAKECH ACCESS API  v1.0             ║');
    console.log(`║   📍  http://localhost:${env.PORT}                  ║`);
    console.log(`║   🔧  Mode: ${env.NODE_ENV.padEnd(33)}║`);
    console.log('║                                              ║');
    console.log('╚══════════════════════════════════════════════╝');
    console.log('');
  });
}

start().catch((error) => {
  console.error('💥 Erreur fatale :', error);
  process.exit(1);
});