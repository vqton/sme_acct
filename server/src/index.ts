import 'dotenv/config';
import app from './presentation/app.js';
import { testConnection, getDb } from './infrastructure/database/connection.js';
import { initDatabase } from './infrastructure/database/schema.js';
import { RoleSeeder } from './infrastructure/database/RoleSeeder.js';
import { SQLiteUserRepository } from './infrastructure/database/UserRepository.js';
import { SQLiteRoleRepository } from './infrastructure/database/RoleRepository.js';

const PORT = Number(process.env.PORT) || 3000;

async function main() {
  testConnection();
  initDatabase();

  const db = getDb();
  new RoleSeeder(new SQLiteUserRepository(db), new SQLiteRoleRepository(db)).seed();

  app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
