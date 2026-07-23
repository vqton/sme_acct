import { describe, it, expect, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import { createTestDb } from '../test/helpers/db.js';
import { seedUser, seedCompany } from '../test/helpers/auth.js';
import { AuthService } from './AuthService.js';
import { verifyToken } from '../infrastructure/auth/jwt.js';
import { SQLiteAuditLogRepository } from '../infrastructure/database/AuditLogRepository.js';
import { SQLiteRefreshTokenRepository } from '../infrastructure/database/RefreshTokenRepository.js';
import { SQLiteUserCompanyRepository } from '../infrastructure/database/UserCompanyRepository.js';
import { SQLiteCompanyRepository } from '../infrastructure/database/CompanyRepository.js';
import { SQLiteUserRepository } from '../infrastructure/database/UserRepository.js';

describe('AuthService — company switching', () => {
  let db: ReturnType<typeof createTestDb>;
  let service: AuthService;
  let userCompanyRepo: SQLiteUserCompanyRepository;
  let companyRepo: SQLiteCompanyRepository;
  let userRepo: SQLiteUserRepository;

  beforeEach(() => {
    db = createTestDb();
    userRepo = new SQLiteUserRepository(db);
    companyRepo = new SQLiteCompanyRepository(db);
    userCompanyRepo = new SQLiteUserCompanyRepository(db);
    const auditRepo = new SQLiteAuditLogRepository(db);
    const refreshTokenRepo = new SQLiteRefreshTokenRepository(db);

    service = new AuthService(
      userRepo,
      auditRepo,
      refreshTokenRepo,
      undefined,
      undefined,
      undefined,
      userCompanyRepo,
      companyRepo,
    );
  });

  describe('login — single company', () => {
    it('auto-selects company and includes companyId in JWT', () => {
      const user = seedUser(db, { username: 'alice' });
      const company = seedCompany(db, { name: 'Acme Corp' });
      userCompanyRepo.create({
        userId: user.id,
        companyId: company.id,
        isActive: true,
        joinedAt: new Date(),
      });

      const result = service.login({ username: 'alice', password: 'TestPass123!' });

      expect(result.token).toBeDefined();
      expect(result.companies).toHaveLength(1);
      expect(result.companies[0].id).toBe(company.id);
      expect(result.companies[0].name).toBe('Acme Corp');

      const payload = verifyToken(result.token!);
      expect(payload.companyId).toBe(company.id);
    });
  });

  describe('login — multiple companies', () => {
    it('returns companies list without a token', () => {
      const user = seedUser(db, { username: 'bob' });
      const c1 = seedCompany(db, { name: 'Company A' });
      const c2 = seedCompany(db, { name: 'Company B' });
      userCompanyRepo.create({ userId: user.id, companyId: c1.id, isActive: true, joinedAt: new Date() });
      userCompanyRepo.create({ userId: user.id, companyId: c2.id, isActive: true, joinedAt: new Date() });

      const result = service.login({ username: 'bob', password: 'TestPass123!' });

      expect(result.token).toBeNull();
      expect(result.companies).toHaveLength(2);
      expect(result.companies.map((c) => c.name).sort()).toEqual(['Company A', 'Company B']);
    });
  });

  describe('login — no companies', () => {
    it('throws error', () => {
      seedUser(db, { username: 'nobody' });

      expect(() =>
        service.login({ username: 'nobody', password: 'TestPass123!' }),
      ).toThrow('No companies assigned');
    });
  });

  describe('selectCompany', () => {
    it('issues JWT with companyId for a valid company the user belongs to', () => {
      const user = seedUser(db, { username: 'carol' });
      const c1 = seedCompany(db, { name: 'C1' });
      const c2 = seedCompany(db, { name: 'C2' });
      userCompanyRepo.create({ userId: user.id, companyId: c1.id, isActive: true, joinedAt: new Date() });
      userCompanyRepo.create({ userId: user.id, companyId: c2.id, isActive: true, joinedAt: new Date() });

      const loginResult = service.login({ username: 'carol', password: 'TestPass123!' });
      expect(loginResult.token).toBeNull();
      const refreshToken = loginResult.refreshToken;

      const result = service.selectCompany(refreshToken, c2.id);

      expect(result.token).toBeDefined();
      expect(result.companies).toHaveLength(2);

      const payload = verifyToken(result.token);
      expect(payload.companyId).toBe(c2.id);
      expect(payload.userId).toBe(user.id);
    });

    it('throws if company not in user_companies', () => {
      const user = seedUser(db, { username: 'dave' });
      const c1 = seedCompany(db, { name: 'C1' });
      const c2 = seedCompany(db, { name: 'C2' });
      userCompanyRepo.create({ userId: user.id, companyId: c1.id, isActive: true, joinedAt: new Date() });

      const loginResult = service.login({ username: 'dave', password: 'TestPass123!' });
      const refreshToken = loginResult.refreshToken;

      expect(() => service.selectCompany(refreshToken, c2.id)).toThrow('not a member');
    });

    it('throws if refresh token is invalid', () => {
      expect(() => service.selectCompany('bad-token', 0)).toThrow();
    });
  });

  describe('refreshToken — preserves companyId', () => {
    it('keeps companyId in refreshed token', () => {
      const user = seedUser(db, { username: 'eve' });
      const company = seedCompany(db, { name: 'Eve Corp' });
      userCompanyRepo.create({ userId: user.id, companyId: company.id, isActive: true, joinedAt: new Date() });

      const loginResult = service.login({ username: 'eve', password: 'TestPass123!' });
      const refreshToken = loginResult.refreshToken;

      const refreshResult = service.refreshToken(refreshToken);
      const payload = verifyToken(refreshResult.token);
      expect(payload.companyId).toBe(company.id);
    });
  });
});
