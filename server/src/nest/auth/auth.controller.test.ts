import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import Database from 'better-sqlite3';
import { AuthModule } from './auth.module.js';
import { createTestDbProvider, DB_PROVIDER } from '../common/database.module.js';
import { runMigrations } from '../../infrastructure/database/schema.js';
import bcrypt from 'bcryptjs';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter.js';
import { generateToken } from '../../infrastructure/auth/jwt.js';

describe('NestJS AuthController', () => {
  let app: INestApplication;
  let db: Database.Database;

  beforeAll(async () => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
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

  describe('POST /auth/register', () => {
    it('registers user with valid input', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'newuser', email: 'new@example.com', password: 'StrongPass1!', fullName: 'New User' });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.username).toBe('newuser');
    });

    it('rejects duplicate username', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'dupuser', email: 'dup1@example.com', password: 'StrongPass1!', fullName: 'User' });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'dupuser', email: 'dup2@example.com', password: 'StrongPass1!', fullName: 'User' });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain('already');
    });

    it('rejects weak password', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'weakuser', email: 'weak@example.com', password: 'short', fullName: 'User' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    const userId = 100;
    const companyId = 101;
    beforeAll(async () => {
      const hash = bcrypt.hashSync('ValidPass1!', 10);
      db.prepare('INSERT INTO users (id, username, email, full_name, password_hash, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(userId, 'loginuser', 'login@example.com', 'Login User', hash, 1, new Date().toISOString());
      db.prepare('INSERT INTO companies (id, name, status, created_at) VALUES (?, ?, ?, ?)')
        .run(companyId, 'Test Company', 1, new Date().toISOString());
      db.prepare('INSERT INTO user_companies (user_id, company_id, is_active) VALUES (?, ?, ?)')
        .run(userId, companyId, 1);
    });

    it('logs in with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'loginuser', password: 'ValidPass1!' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.user.username).toBe('loginuser');
    });

    it('rejects invalid password', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'loginuser', password: 'WrongPass1!' });

      expect(res.status).toBe(401);
    });

    it('rejects non-existent user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'nobody', password: 'AnyPass1!' });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/login (no company)', () => {
    let noCompanyUserId: number;
    beforeAll(async () => {
      noCompanyUserId = 1000;
      const hash = bcrypt.hashSync('NoComp1!', 10);
      db.prepare('INSERT INTO users (id, username, email, full_name, password_hash, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(noCompanyUserId, 'nocompany', 'nocompany@example.com', 'No Company', hash, 1, new Date().toISOString());
    });

    it('returns 401 when user has no company', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'nocompany', password: 'NoComp1!' });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/refresh', () => {
    const userId = 1001;
    const companyId = 101;
    let refreshToken: string;

    beforeAll(async () => {
      const hash = bcrypt.hashSync('TestPass1!', 10);
      db.prepare('INSERT INTO users (id, username, email, full_name, password_hash, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(userId, 'refreshuser', 'refresh@example.com', 'Refresh User', hash, 1, new Date().toISOString());
      db.prepare('INSERT INTO user_companies (user_id, company_id, is_active) VALUES (?, ?, ?)')
        .run(userId, companyId, 1);

      // Get a refresh token by logging in
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'refreshuser', password: 'TestPass1!' });
      refreshToken = loginRes.body.refreshToken;
    });

    it('refreshes token with valid refresh token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it('rejects invalid refresh token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /auth/sessions (auth required)', () => {
    const userId = 4;
    let authToken: string;

    beforeAll(async () => {
      const hash = bcrypt.hashSync('SeshPass1!', 10);
      db.prepare('INSERT INTO users (id, username, email, full_name, password_hash, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(userId, 'sessuser', 'sess@example.com', 'Sess User', hash, 1, new Date().toISOString());

      authToken = generateToken({ userId, username: 'sessuser' });
    });

    it('returns sessions for authenticated user', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/sessions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.sessions).toBeDefined();
    });

    it('rejects without auth token', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/sessions');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/logout (auth required)', () => {
    const userId = 5;
    let authToken: string;

    beforeAll(async () => {
      const hash = bcrypt.hashSync('Logout1!', 10);
      db.prepare('INSERT INTO users (id, username, email, full_name, password_hash, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(userId, 'logoutuser', 'logout@example.com', 'Logout User', hash, 1, new Date().toISOString());
      authToken = generateToken({ userId, username: 'logoutuser' });
    });

    it('logs out authenticated user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
    });
  });

  describe('POST /auth/forgot-password', () => {
    const userId = 6;
    beforeAll(async () => {
      const hash = bcrypt.hashSync('FPUser1!', 10);
      db.prepare('INSERT INTO users (id, username, email, full_name, password_hash, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(userId, 'fpuser', 'fp@example.com', 'FP User', hash, 1, new Date().toISOString());
    });

    it('returns token for existing email', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'fp@example.com' });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
    });

    it('returns 201 even for non-existent email (security)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'nobody@example.com' });

      expect(res.status).toBe(201);
    });
  });

  describe('POST /auth/change-password (auth required)', () => {
    const userId = 7;
    let authToken: string;

    beforeAll(async () => {
      const hash = bcrypt.hashSync('OldPass1!', 10);
      db.prepare('INSERT INTO users (id, username, email, full_name, password_hash, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(userId, 'changepw', 'changepw@example.com', 'Change PW', hash, 1, new Date().toISOString());
      authToken = generateToken({ userId, username: 'changepw' });
    });

    it('changes password with valid old password', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ oldPassword: 'OldPass1!', newPassword: 'NewPass123!' });

      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
    });

    it('rejects with wrong old password', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ oldPassword: 'WrongPass1!', newPassword: 'NewPass123!' });

      expect(res.status).toBe(401);
    });
  });
});
