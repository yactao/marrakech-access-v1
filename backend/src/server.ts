import app from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';

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