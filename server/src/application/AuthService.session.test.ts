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

describe('Session management', () => {
  let db: ReturnType<typeof createTestDb>;
  let service: AuthService;
  let refreshTokenRepo: SQLiteRefreshTokenRepository;
  let userCompanyRepo: SQLiteUserCompanyRepository;
  let companyRepo: SQLiteCompanyRepository;
  let userRepo: SQLiteUserRepository;

  beforeEach(() => {
    db = createTestDb();
    userRepo = new SQLiteUserRepository(db);
    companyRepo = new SQLiteCompanyRepository(db);
    userCompanyRepo = new SQLiteUserCompanyRepository(db);
    refreshTokenRepo = new SQLiteRefreshTokenRepository(db);
    const auditRepo = new SQLiteAuditLogRepository(db);

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

  describe('refresh token stores session metadata', () => {
    it('saves ip_address and user_agent on login', () => {
      const user = seedUser(db, { username: 'sess1' });
      const company = seedCompany(db, { name: 'S1' });
      userCompanyRepo.create({ userId: user.id, companyId: company.id, isActive: true, joinedAt: new Date() });

      service.login(
        { username: 'sess1', password: 'TestPass123!' },
        { ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0 Chrome' },
      );

      const sessions = refreshTokenRepo.findAllActiveForUser(user.id);
      expect(sessions).toHaveLength(1);
      expect(sessions[0].ipAddress).toBe('192.168.1.100');
      expect(sessions[0].userAgent).toBe('Mozilla/5.0 Chrome');
    });
  });

  describe('listActiveSessions', () => {
    it('returns all active sessions for a user', () => {
      const user = seedUser(db, { username: 'sess2' });
      const company = seedCompany(db, { name: 'S2' });
      userCompanyRepo.create({ userId: user.id, companyId: company.id, isActive: true, joinedAt: new Date() });

      service.login({ username: 'sess2', password: 'TestPass123!' }, { ipAddress: '10.0.0.1', userAgent: 'Chrome' });
      service.login({ username: 'sess2', password: 'TestPass123!' }, { ipAddress: '10.0.0.2', userAgent: 'Firefox' });

      const sessions = service.listActiveSessions(user.id);
      expect(sessions).toHaveLength(2);
    });

    it('excludes revoked sessions', () => {
      const user = seedUser(db, { username: 'sess3' });
      const company = seedCompany(db, { name: 'S3' });
      userCompanyRepo.create({ userId: user.id, companyId: company.id, isActive: true, joinedAt: new Date() });

      service.login({ username: 'sess3', password: 'TestPass123!' }, { ipAddress: '10.0.0.1', userAgent: 'Chrome' });
      const second = service.login({ username: 'sess3', password: 'TestPass123!' }, { ipAddress: '10.0.0.2', userAgent: 'Firefox' });

      service.revokeSession(user.id, second.refreshToken);

      const sessions = service.listActiveSessions(user.id);
      expect(sessions).toHaveLength(1);
    });
  });

  describe('revokeSession', () => {
    it('revokes a specific session without affecting others', () => {
      const user = seedUser(db, { username: 'sess4' });
      const company = seedCompany(db, { name: 'S4' });
      userCompanyRepo.create({ userId: user.id, companyId: company.id, isActive: true, joinedAt: new Date() });

      const first = service.login({ username: 'sess4', password: 'TestPass123!' }, { ipAddress: '10.0.0.1', userAgent: 'Chrome' });
      service.login({ username: 'sess4', password: 'TestPass123!' }, { ipAddress: '10.0.0.2', userAgent: 'Firefox' });

      service.revokeSession(user.id, first.refreshToken);

      const sessions = service.listActiveSessions(user.id);
      expect(sessions).toHaveLength(1);
      expect(sessions[0].ipAddress).toBe('10.0.0.2');
    });

    it('ignores revoke for a token that does not belong to the user', () => {
      const user1 = seedUser(db, { username: 'u1' });
      const user2 = seedUser(db, { username: 'u2', email: 'u2@example.com' });
      const company = seedCompany(db, { name: 'SC' });
      userCompanyRepo.create({ userId: user1.id, companyId: company.id, isActive: true, joinedAt: new Date() });
      userCompanyRepo.create({ userId: user2.id, companyId: company.id, isActive: true, joinedAt: new Date() });

      const u1Session = service.login({ username: 'u1', password: 'TestPass123!' });
      service.login({ username: 'u2', password: 'TestPass123!' });

      // Try to revoke u1's session as u2 — should be ignored
      service.revokeSession(user2.id, u1Session.refreshToken);

      const u1Sessions = service.listActiveSessions(user1.id);
      expect(u1Sessions).toHaveLength(1);
    });
  });

  describe('revokeAllSessions', () => {
    it('revokes all sessions for a user', () => {
      const user = seedUser(db, { username: 'sess5' });
      const company = seedCompany(db, { name: 'S5' });
      userCompanyRepo.create({ userId: user.id, companyId: company.id, isActive: true, joinedAt: new Date() });

      service.login({ username: 'sess5', password: 'TestPass123!' });
      service.login({ username: 'sess5', password: 'TestPass123!' });

      service.revokeAllSessions(user.id);

      const sessions = service.listActiveSessions(user.id);
      expect(sessions).toHaveLength(0);
    });
  });
});
