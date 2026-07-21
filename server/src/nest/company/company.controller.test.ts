import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import Database from 'better-sqlite3';
import { CompanyModule } from './company.module.js';
import { createTestDbProvider, DB_PROVIDER } from '../common/database.module.js';
import { runMigrations } from '../../infrastructure/database/schema.js';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter.js';
import { generateToken } from '../../infrastructure/auth/jwt.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

describe('NestJS CompanyController', () => {
  let app: INestApplication;
  let db: Database.Database;
  let authToken: string;
  const userId = crypto.randomUUID();
  const companyId = crypto.randomUUID();

  beforeAll(async () => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);

    // Seed: user with he-thong role (has all company permissions)
    const hash = bcrypt.hashSync('TestPass1!', 10);
    db.prepare('INSERT INTO users (id, username, email, full_name, password_hash, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(userId, 'companyadmin', 'admin@example.com', 'Company Admin', hash, 1, new Date().toISOString());
    db.prepare('INSERT INTO user_roles (user_id, role) VALUES (?, ?)').run(userId, 'he-thong');
    authToken = generateToken({ userId, username: 'companyadmin', roles: ['he-thong'] });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CompanyModule],
    })
      .overrideProvider(DB_PROVIDER)
      .useValue(db)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    db.close();
  });

  describe('POST /companies', () => {
    it('creates a company', async () => {
      const res = await request(app.getHttpServer())
        .post('/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test Company', status: 1 });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.name).toBe('Test Company');
    });
  });

  describe('GET /companies', () => {
    it('lists companies', async () => {
      const res = await request(app.getHttpServer())
        .get('/companies')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /companies/:id', () => {
    it('gets company by id', async () => {
      // Create first
      const createRes = await request(app.getHttpServer())
        .post('/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Get Test Co', status: 1 });
      const id = createRes.body.id;

      const res = await request(app.getHttpServer())
        .get(`/companies/${id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Get Test Co');
    });
  });

  describe('PUT /companies/:id', () => {
    it('updates a company', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Update Test', status: 1 });
      const id = createRes.body.id;

      const res = await request(app.getHttpServer())
        .put(`/companies/${id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Name');
    });
  });

  describe('POST /companies/:id/activate', () => {
    it('activates a suspended company', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Activate Test', status: 1 });
      const id = createRes.body.id;

      // First suspend
      await request(app.getHttpServer())
        .post(`/companies/${id}/suspend`)
        .set('Authorization', `Bearer ${authToken}`);

      // Then activate
      const res = await request(app.getHttpServer())
        .post(`/companies/${id}/activate`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe(1);
    });
  });

  describe('POST /companies/:id/suspend', () => {
    it('suspends an active company', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Suspend Test', status: 1 });
      const id = createRes.body.id;

      const res = await request(app.getHttpServer())
        .post(`/companies/${id}/suspend`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe(2);
    });
  });

  describe('DELETE /companies/:id', () => {
    it('deletes a company', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Delete Test', status: 1 });
      const id = createRes.body.id;

      const res = await request(app.getHttpServer())
        .delete(`/companies/${id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(204);
    });
  });

  describe('Auth guard', () => {
    it('rejects without token', async () => {
      const res = await request(app.getHttpServer())
        .get('/companies');
      expect(res.status).toBe(401);
    });

    it('rejects with invalid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/companies')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
    });
  });
});
