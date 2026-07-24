import 'dotenv/config';
import { createNestApp } from './nest/bootstrap.js';
import { testConnection, getDb } from './infrastructure/database/connection.js';
import { initDatabase } from './infrastructure/database/schema.js';

const PORT = Number(process.env.PORT) || 3000;

async function main() {
  testConnection();
  initDatabase();

  const app = await createNestApp();
  await app.listen(PORT);
  console.log(`✓ NestJS server running on http://localhost:${PORT}`);

  const shutdown = async () => {
    console.log('\nShutting down...');
    const forceExit = setTimeout(() => process.exit(1), 5000).unref();
    await app.close();
    clearTimeout(forceExit);
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
