import { Module, Global } from '@nestjs/common';
import Database from 'better-sqlite3';
import { getDb } from '../../infrastructure/database/connection.js';
import { runMigrations } from '../../infrastructure/database/schema.js';

export const DB_PROVIDER = 'DB_CONNECTION';

@Global()
@Module({
  providers: [
    {
      provide: DB_PROVIDER,
      useFactory: () => getDb(),
    },
  ],
  exports: [DB_PROVIDER],
})
export class DatabaseModule {}

export function createTestDbProvider(db?: Database.Database) {
  return {
    provide: DB_PROVIDER,
    useFactory: () => {
      const testDb = db ?? new Database(':memory:');
      testDb.pragma('foreign_keys = ON');
      runMigrations(testDb);
      return testDb;
    },
  };
}
