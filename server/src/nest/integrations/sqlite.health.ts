import { Injectable, Inject } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import Database from 'better-sqlite3';
import { DB_PROVIDER } from '../common/database.module.js';

@Injectable()
export class SQLiteHealthIndicator extends HealthIndicator {
  constructor(@Inject(DB_PROVIDER) private db: Database.Database) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      this.db.prepare('SELECT 1').get();
      return this.getStatus(key, true);
    } catch (e) {
      throw new HealthCheckError(
        'Database check failed',
        this.getStatus(key, false, { message: (e as Error).message }),
      );
    }
  }
}
