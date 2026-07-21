import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import Database from 'better-sqlite3';
import { AppModule } from '../app.module.js';
import { createTestDbProvider, DB_PROVIDER } from '../common/database.module.js';
import { runMigrations } from '../../infrastructure/database/schema.js';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter.js';
import { I18nService } from 'nestjs-i18n';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('I18nModule', () => {
  let app: INestApplication;
  let db: Database.Database;
  let i18nService: I18nService<Record<string, unknown>>;

  beforeAll(async () => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DB_PROVIDER)
      .useValue(db)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(app.get(HttpExceptionFilter));
    await app.init();

    i18nService = app.get(I18nService);
  });

  afterAll(async () => {
    await app.close();
    db.close();
  });

  it('I18nService is available', () => {
    expect(i18nService).toBeDefined();
  });

  it('translates error key to Vietnamese', async () => {
    const msg = await i18nService.translate('errors.InvalidCredentialsError', { lang: 'vi' });
    expect(msg).toBe('Thông tin đăng nhập không đúng');
  });

  it('translates error key to English', async () => {
    const msg = await i18nService.translate('errors.InvalidCredentialsError', { lang: 'en' });
    expect(msg).toBe('Invalid credentials');
  });

  it('returns fallback when key is missing', async () => {
    const msg = await i18nService.translate('errors.NonexistentError', { lang: 'vi' });
    expect(msg).toBe('errors.NonexistentError');
  });

  it('returns translated error for VI locale via filter', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .set('Accept-Language', 'vi')
      .send({ username: 'nonexistent', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Thông tin đăng nhập không đúng');
  });

  it('returns English error for EN locale via filter', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .set('Accept-Language', 'en')
      .send({ username: 'nonexistent', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('returns English error by default when no Accept-Language', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'nonexistent', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });
});
