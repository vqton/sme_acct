import Database, { type Database as DatabaseType } from 'better-sqlite3';
import { runMigrations } from '../../infrastructure/database/schema.js';
import { SQLiteUserRepository } from '../../infrastructure/database/UserRepository.js';
import { SQLiteCompanyRepository } from '../../infrastructure/database/CompanyRepository.js';

export function createTestDb(): DatabaseType {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  runMigrations(db);
  return db;
}

export function createTestRepos(db: DatabaseType) {
  const userRepo = new SQLiteUserRepository(db);
  const companyRepo = new SQLiteCompanyRepository(db);
  return { userRepo, companyRepo };
}
