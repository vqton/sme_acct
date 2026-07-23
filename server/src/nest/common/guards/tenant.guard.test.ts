import { describe, it, expect, beforeAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import Database from 'better-sqlite3';
import { TenantGuard } from './tenant.guard.js';
import { DB_PROVIDER } from '../database.module.js';
import { runMigrations } from '../../../infrastructure/database/schema.js';

describe('TenantGuard', () => {
  let guard: TenantGuard;
  let db: Database.Database;
  const userId = 1;
  const companyId1 = 100;
  const companyId2 = 101;

  beforeAll(async () => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);

    // Seed user with two companies
    const hash = 'x'; // not used for auth in guard tests
    db.prepare('INSERT INTO users (id, username, email, full_name, password_hash, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(userId, 'tenantuser', 'tenant@example.com', 'Tenant User', hash, 1, new Date().toISOString());
    db.prepare('INSERT INTO companies (id, name, status, created_at) VALUES (?, ?, ?, ?)')
      .run(companyId1, 'Company One', 1, new Date().toISOString());
    db.prepare('INSERT INTO companies (id, name, status, created_at) VALUES (?, ?, ?, ?)')
      .run(companyId2, 'Company Two', 1, new Date().toISOString());
    db.prepare('INSERT INTO user_companies (user_id, company_id, is_active) VALUES (?, ?, ?)')
      .run(userId, companyId1, 1);
    db.prepare('INSERT INTO user_companies (user_id, company_id, is_active) VALUES (?, ?, ?)')
      .run(userId, companyId2, 1);

    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantGuard, { provide: DB_PROVIDER, useValue: db }],
    }).compile();

    guard = module.get(TenantGuard);
  });

  function makeContext(user?: { userId: number; username: string; roles: string[] }, params: Record<string, string> = {}) {
    const req: any = { params, headers: {} };
    if (user) req.user = user;
    return {
      switchToHttp: () => ({ getRequest: () => req }),
      getHandler: () => () => {},
      getClass: () => class {},
    } as any;
  }

  it('allows access when user belongs to company (via :id)', () => {
    const ctx = makeContext(
      { userId, username: 'tenantuser', roles: [] },
      { id: String(companyId1) },
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows access when user belongs to company (via :companyId)', () => {
    const ctx = makeContext(
      { userId, username: 'tenantuser', roles: [] },
      { companyId: String(companyId2) },
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('blocks access when user does not belong to company', () => {
    const ctx = makeContext(
      { userId, username: 'tenantuser', roles: [] },
      { id: '999' },
    );
    expect(() => guard.canActivate(ctx)).toThrow('Access to this company is not allowed');
  });

  it('returns 401 when user not authenticated', () => {
    const ctx = makeContext(undefined, { id: String(companyId1) });
    expect(() => guard.canActivate(ctx)).toThrow('Authentication required');
  });

  it('passes when no company id in params', () => {
    const ctx = makeContext(
      { userId, username: 'tenantuser', roles: [] },
      {},
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('sets userCompanyIds on request', () => {
    const req: any = { params: {}, headers: {} };
    req.user = { userId, username: 'tenantuser', roles: [] };
    const ctx = {
      switchToHttp: () => ({ getRequest: () => req }),
      getHandler: () => () => {},
      getClass: () => class {},
    } as any;
    guard.canActivate(ctx);
    expect(req.userCompanyIds).toBeDefined();
    expect(req.userCompanyIds).toContain(companyId1);
    expect(req.userCompanyIds).toContain(companyId2);
  });
});
