import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import Database from 'better-sqlite3';
import { DashboardModule } from './dashboard.module.js';
import { DB_PROVIDER } from '../common/database.module.js';
import { CompanyModule } from '../company/company.module.js';
import { runMigrations } from '../../infrastructure/database/schema.js';
import { generateToken } from '../../infrastructure/auth/jwt.js';
import bcrypt from 'bcryptjs';

describe('DashboardController', () => {
  let app: INestApplication;
  let db: Database.Database;
  let authToken: string;
  const userId = 1;

  beforeAll(async () => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);

    const hash = bcrypt.hashSync('TestPass1!', 10);
    db.prepare('INSERT INTO users (id, username, email, full_name, password_hash, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(userId, 'dashadmin', 'dash@example.com', 'Dash Admin', hash, 1, new Date().toISOString());
    db.prepare('INSERT INTO user_roles (user_id, role) VALUES (?, ?)').run(userId, 'he-thong');
    authToken = generateToken({ userId, username: 'dashadmin', roles: ['he-thong'] });

    // Seed companies
    const co1 = 100;
    db.prepare(`INSERT INTO companies (id, name, status, charter_capital, paid_in_capital, created_at)
      VALUES (?, ?, 1, 10000000000, 5000000000, ?)`).run(co1, 'Công ty A', new Date().toISOString());
    const co2 = 101;
    db.prepare(`INSERT INTO companies (id, name, status, charter_capital, paid_in_capital, created_at)
      VALUES (?, ?, 2, 5000000000, 2500000000, ?)`).run(co2, 'Công ty B', new Date().toISOString());

    // Seed legal reps
    db.prepare(`INSERT INTO legal_representatives (id, company_id, full_name, position, is_primary, is_active, created_at)
      VALUES (?, ?, 'Nguyen Van A', 'Giam doc', 1, 1, ?)`).run(1, co1, new Date().toISOString());
    db.prepare(`INSERT INTO legal_representatives (id, company_id, full_name, position, is_primary, is_active, created_at)
      VALUES (?, ?, 'Nguyen Van B', 'Pho giam doc', 1, 1, ?)`).run(2, co2, new Date().toISOString());

    // Seed contributors
    db.prepare(`INSERT INTO capital_contributors (id, company_id, contributor_type, full_name, contributor_category, capital_contribution, ownership_ratio, contribution_date, is_founder, created_at)
      VALUES (?, ?, 1, 'Nguyen Van C', 1, 5000000000, 50, '2024-01-01', 1, ?)`).run(1, co1, new Date().toISOString());

    // Seed bank accounts
    db.prepare(`INSERT INTO company_bank_accounts (id, company_id, account_number, account_name, bank_name, currency_code, is_primary_tax_payment, is_active, opened_date, created_at)
      VALUES (?, ?, '123456789', 'Company A', 'VCB', 'VND', 1, 1, '2024-01-01', ?)`).run(1, co1, new Date().toISOString());

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [DashboardModule, CompanyModule],
    })
      .overrideProvider(DB_PROVIDER)
      .useValue(db)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    db.close();
  });

  describe('GET /dashboard', () => {
    it('returns dashboard summary', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.summary).toBeDefined();
      expect(res.body.summary.totalCompanies).toBe(2);
      expect(res.body.summary.activeCompanies).toBe(1);
      expect(res.body.summary.totalCharterCapital).toBe(15000000000);
      expect(res.body.summary.totalPaidInCapital).toBe(7500000000);
      expect(res.body.summary.totalLegalReps).toBe(2);
      expect(res.body.summary.totalContributors).toBe(1);
      expect(res.body.summary.totalBankAccounts).toBe(1);
    });

    it('returns companies by status breakdown', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.companiesByStatus.length).toBeGreaterThanOrEqual(2);
    });

    it('returns recent companies', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.recentCompanies.length).toBe(2);
    });

    it('rejects without auth', async () => {
      const res = await request(app.getHttpServer()).get('/dashboard');
      expect(res.status).toBe(401);
    });
  });
});
