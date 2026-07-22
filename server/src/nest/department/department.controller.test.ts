import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import Database from 'better-sqlite3';
import { DepartmentModule } from './department.module.js';
import { DB_PROVIDER } from '../common/database.module.js';
import { runMigrations } from '../../infrastructure/database/schema.js';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter.js';
import { generateToken } from '../../infrastructure/auth/jwt.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

describe('NestJS DepartmentController', () => {
  let app: INestApplication;
  let db: Database.Database;
  let authToken: string;
  const userId = crypto.randomUUID();
  const companyId = crypto.randomUUID();

  beforeAll(async () => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);

    const hash = bcrypt.hashSync('TestPass1!', 10);
    db.prepare('INSERT INTO users (id, username, email, full_name, password_hash, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(userId, 'deptadmin', 'admin@example.com', 'Dept Admin', hash, 1, new Date().toISOString());
    db.prepare('INSERT INTO user_roles (user_id, role) VALUES (?, ?)').run(userId, 'he-thong');
    authToken = generateToken({ userId, username: 'deptadmin', roles: ['he-thong'] });

    db.prepare('INSERT INTO companies (id, name, status, created_at) VALUES (?, ?, ?, ?)')
      .run(companyId, 'Dept Test Co', 1, new Date().toISOString());
    db.prepare('INSERT INTO user_companies (user_id, company_id, is_active) VALUES (?, ?, ?)')
      .run(userId, companyId, 1);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [DepartmentModule],
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

  const basePath = `/companies/${companyId}/departments`;

  describe('POST /companies/:companyId/departments', () => {
    it('creates root department', async () => {
      const res = await request(app.getHttpServer())
        .post(basePath)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: 'TCKT', name: 'Tài chính Kế toán' });
      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.code).toBe('TCKT');
      expect(res.body.depth).toBe(0);
    });

    it('creates child department', async () => {
      const parentRes = await request(app.getHttpServer())
        .post(basePath)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: 'KD', name: 'Kinh doanh' });
      const childRes = await request(app.getHttpServer())
        .post(basePath)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: 'BH', name: 'Bán hàng', parentId: parentRes.body.id });
      expect(childRes.status).toBe(201);
      expect(childRes.body.parentId).toBe(parentRes.body.id);
      expect(childRes.body.depth).toBe(1);
    });

    it('rejects duplicate code', async () => {
      const res = await request(app.getHttpServer())
        .post(basePath)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: 'TCKT', name: 'Duplicate' });
      expect(res.status).toBe(500);
    });
  });

  describe('GET /companies/:companyId/departments', () => {
    it('lists departments', async () => {
      const res = await request(app.getHttpServer())
        .get(basePath)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /companies/:companyId/departments/:id', () => {
    it('gets department by id', async () => {
      const createRes = await request(app.getHttpServer())
        .post(basePath)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: 'GETID', name: 'Get ID' });
      const res = await request(app.getHttpServer())
        .get(`${basePath}/${createRes.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Get ID');
    });
  });

  describe('PUT /companies/:companyId/departments/:id', () => {
    it('updates department', async () => {
      const createRes = await request(app.getHttpServer())
        .post(basePath)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: 'PUT', name: 'Original' });
      const res = await request(app.getHttpServer())
        .put(`${basePath}/${createRes.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated' });
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated');
    });
  });

  describe('PATCH /companies/:companyId/departments/:id/reparent', () => {
    it('reparents department', async () => {
      const p1 = await request(app.getHttpServer()).post(basePath).set('Authorization', `Bearer ${authToken}`).send({ code: 'RP1', name: 'P1' });
      const p2 = await request(app.getHttpServer()).post(basePath).set('Authorization', `Bearer ${authToken}`).send({ code: 'RP2', name: 'P2' });
      const child = await request(app.getHttpServer()).post(basePath).set('Authorization', `Bearer ${authToken}`).send({ code: 'RPC', name: 'Child', parentId: p1.body.id });
      const res = await request(app.getHttpServer())
        .patch(`${basePath}/${child.body.id}/reparent`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ newParentId: p2.body.id });
      expect(res.status).toBe(200);
      expect(res.body.parentId).toBe(p2.body.id);
    });
  });

  describe('POST /companies/:companyId/departments/:id/deactivate', () => {
    it('deactivates department', async () => {
      const createRes = await request(app.getHttpServer())
        .post(basePath)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: 'DEACT', name: 'Deactivate' });
      const res = await request(app.getHttpServer())
        .post(`${basePath}/${createRes.body.id}/deactivate`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(2);
    });
  });

  describe('POST /companies/:companyId/departments/:id/reactivate', () => {
    it('reactivates department', async () => {
      const createRes = await request(app.getHttpServer())
        .post(basePath)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: 'REACT', name: 'Reactivate' });
      await request(app.getHttpServer())
        .post(`${basePath}/${createRes.body.id}/deactivate`)
        .set('Authorization', `Bearer ${authToken}`);
      const res = await request(app.getHttpServer())
        .post(`${basePath}/${createRes.body.id}/reactivate`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(1);
    });
  });

  describe('POST /companies/:companyId/departments/:id/dissolve', () => {
    it('dissolves department', async () => {
      const createRes = await request(app.getHttpServer())
        .post(basePath)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: 'DISS', name: 'Dissolve' });
      const res = await request(app.getHttpServer())
        .post(`${basePath}/${createRes.body.id}/dissolve`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ dissolutionDate: '2026-07-01' });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(3);
    });
  });

  describe('DELETE /companies/:companyId/departments/:id', () => {
    it('deletes leaf department', async () => {
      const createRes = await request(app.getHttpServer())
        .post(basePath)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: 'DEL', name: 'Delete Me' });
      const res = await request(app.getHttpServer())
        .delete(`${basePath}/${createRes.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(204);
    });
  });

  describe('User-Department endpoints', () => {
    let deptId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post(basePath)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: 'USERDEPT', name: 'User Dept' });
      deptId = res.body.id;
    });

    it('assigns user to department', async () => {
      const res = await request(app.getHttpServer())
        .post(`${basePath}/${deptId}/users`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ userId, isPrimary: true, jobTitle: 'Trưởng phòng' });
      expect(res.status).toBe(201);
    });

    it('lists department users', async () => {
      const res = await request(app.getHttpServer())
        .get(`${basePath}/${deptId}/users`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('Auth guard', () => {
    it('rejects without token', async () => {
      const res = await request(app.getHttpServer()).get(basePath);
      expect(res.status).toBe(401);
    });
  });
});
