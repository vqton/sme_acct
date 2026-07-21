import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import Database from 'better-sqlite3';
import { runMigrations } from '../../infrastructure/database/schema.js';
import { DB_PROVIDER, createTestDbProvider } from '../common/database.module.js';
import { AppHealthModule } from './health.module.js';
import { SQLiteHealthIndicator } from './sqlite.health.js';

describe('AppHealthModule', () => {
  let app: INestApplication;
  let db: Database.Database;

  beforeAll(async () => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);

    const mod = await Test.createTestingModule({
      imports: [AppHealthModule],
    })
      .overrideProvider(DB_PROVIDER)
      .useValue(db)
      .compile();

    app = mod.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    db.close();
  });

  it('GET / returns API info', async () => {
    const res = await request(app.getHttpServer()).get('/');
    expect(res.status).toBe(200);
    expect(res.body.name).toContain('SME Accounting');
  });

  it('GET /api/health returns up status with database check', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.info.database).toBeDefined();
    expect(res.body.info.database.status).toBe('up');
  });

  it('SQLiteHealthIndicator is injectable', () => {
    const indicator = app.get(SQLiteHealthIndicator);
    expect(indicator).toBeDefined();
  });
});
