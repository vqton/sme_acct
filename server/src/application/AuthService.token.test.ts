import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb, createTestRepos } from '../test/helpers/db.js';
import { seedUser } from '../test/helpers/auth.js';
import { AuthService } from './AuthService.js';
import { SQLiteAuditLogRepository } from '../infrastructure/database/AuditLogRepository.js';
import { SQLiteRefreshTokenRepository } from '../infrastructure/database/RefreshTokenRepository.js';
import { SQLitePasswordHistoryRepository } from '../infrastructure/database/PasswordHistoryRepository.js';
import { SQLitePasswordResetTokenRepository } from '../infrastructure/database/PasswordResetTokenRepository.js';

describe('AuthService - Token Management', () => {
  let db: ReturnType<typeof createTestDb>;
  let service: AuthService;

  beforeEach(() => {
    db = createTestDb();
    const { userRepo } = createTestRepos(db);
    const auditRepo = new SQLiteAuditLogRepository(db);
    const refreshTokenRepo = new SQLiteRefreshTokenRepository(db);
    const passwordHistoryRepo = new SQLitePasswordHistoryRepository(db);
    const passwordResetTokenRepo = new SQLitePasswordResetTokenRepository(db);
    service = new AuthService(userRepo, auditRepo, refreshTokenRepo, undefined, passwordHistoryRepo, passwordResetTokenRepo);
  });

  describe('refreshToken', () => {
    it('issues new access token for valid refresh token', () => {
      const user = seedUser(db);
      const loginResult = service.login({ username: user.username, password: 'TestPass123!' });

      const refreshed = service.refreshToken(loginResult.refreshToken);
      expect(refreshed.token).toBeDefined();
      expect(refreshed.token).not.toBe(loginResult.token);
      expect(refreshed.refreshToken).toBeDefined();
      expect(refreshed.refreshToken).not.toBe(loginResult.refreshToken);
      expect(refreshed.user.id).toBe(user.id);
    });

    it('rejects revoked refresh token', () => {
      const user = seedUser(db);
      const loginResult = service.login({ username: user.username, password: 'TestPass123!' });

      service.revokeAllSessions(user.id);
      expect(() => service.refreshToken(loginResult.refreshToken)).toThrow('Invalid credentials');
    });

    it('rejects expired refresh token', () => {
      const user = seedUser(db);
      const loginResult = service.login({ username: user.username, password: 'TestPass123!' });

      db.prepare('UPDATE refresh_tokens SET expires_at = ?').run(new Date(Date.now() - 86400000).toISOString());
      expect(() => service.refreshToken(loginResult.refreshToken)).toThrow('Invalid credentials');
    });

    it('rejects non-existent token', () => {
      expect(() => service.refreshToken('non-existent-token')).toThrow('Invalid credentials');
    });
  });

  describe('changePassword', () => {
    it('changes password with valid old password', () => {
      const user = seedUser(db);
      service.changePassword(user.id, 'TestPass123!', 'NewStrongPass1!');

      const result = service.login({ username: user.username, password: 'NewStrongPass1!' });
      expect(result.token).toBeDefined();
    });

    it('rejects wrong old password', () => {
      const user = seedUser(db);
      expect(() => service.changePassword(user.id, 'WrongPass1!', 'NewStrongPass1!')).toThrow('Invalid credentials');
    });

    it('revokes all refresh tokens after password change', () => {
      const user = seedUser(db);
      const loginResult = service.login({ username: user.username, password: 'TestPass123!' });

      service.changePassword(user.id, 'TestPass123!', 'NewStrongPass1!');
      expect(() => service.refreshToken(loginResult.refreshToken)).toThrow('Invalid credentials');
    });

    it('validates new password strength', () => {
      const user = seedUser(db);
      expect(() => service.changePassword(user.id, 'TestPass123!', 'weak')).toThrow('Password must be at least 8 characters');
    });

    it('logs audit event on password change', () => {
      const user = seedUser(db);
      service.changePassword(user.id, 'TestPass123!', 'NewStrongPass1!');

      const logs = db.prepare('SELECT * FROM audit_logs WHERE action = ?').all('PASSWORD_CHANGED') as Record<string, unknown>[];
      expect(logs.length).toBe(1);
      expect(logs[0].user_id).toBe(user.id);
    });
  });

  describe('revokeAllSessions', () => {
    it('revokes all active sessions for user', () => {
      const user = seedUser(db);
      const login1 = service.login({ username: user.username, password: 'TestPass123!' });
      const login2 = service.login({ username: user.username, password: 'TestPass123!' });

      service.revokeAllSessions(user.id);
      expect(() => service.refreshToken(login1.refreshToken)).toThrow('Invalid credentials');
      expect(() => service.refreshToken(login2.refreshToken)).toThrow('Invalid credentials');
    });
  });

  describe('password history', () => {
    it('rejects password reuse from last 5 passwords', () => {
      const user = seedUser(db);
      service.changePassword(user.id, 'TestPass123!', 'NewPass111!');
      expect(() => service.changePassword(user.id, 'NewPass111!', 'TestPass123!')).toThrow(/reuse/i);
    });

    it('allows password after 6th different password', () => {
      const user = seedUser(db);
      service.changePassword(user.id, 'TestPass123!', 'NewPass222!');
      service.changePassword(user.id, 'NewPass222!', 'NewPass333!');
      service.changePassword(user.id, 'NewPass333!', 'NewPass444!');
      service.changePassword(user.id, 'NewPass444!', 'NewPass555!');
      service.changePassword(user.id, 'NewPass555!', 'NewPass666!');
      service.changePassword(user.id, 'NewPass666!', 'NewPass777!');
      expect(() => service.changePassword(user.id, 'NewPass777!', 'TestPass123!')).not.toThrow();
    });

    it('stores password history on change', () => {
      const user = seedUser(db);
      service.changePassword(user.id, 'TestPass123!', 'NewPass111!');

      const history = db.prepare('SELECT * FROM password_history WHERE user_id = ?').all(user.id) as any[];
      expect(history.length).toBe(1);
    });
  });

  describe('forgotPassword', () => {
    it('returns token for existing email', () => {
      seedUser(db, { email: 'reset@example.com' });
      const result = service.forgotPassword('reset@example.com');
      expect(result.token).toBeDefined();
      expect(result.token.length).toBeGreaterThan(0);
    });

    it('returns empty token for non-existent email', () => {
      const result = service.forgotPassword('nobody@example.com');
      expect(result.token).toBe('');
    });

    it('logs PASSWORD_RESET_REQUESTED audit event', () => {
      seedUser(db, { email: 'reset@example.com' });
      service.forgotPassword('reset@example.com');

      const logs = db.prepare('SELECT * FROM audit_logs WHERE action = ?').all('PASSWORD_RESET_REQUESTED') as any[];
      expect(logs.length).toBe(1);
    });
  });

  describe('resetPassword', () => {
    it('resets password with valid token', () => {
      const user = seedUser(db, { email: 'reset@example.com' });
      const { token } = service.forgotPassword('reset@example.com');

      service.resetPassword(token, 'ResetPass111!');

      const result = service.login({ username: user.username, password: 'ResetPass111!' });
      expect(result.token).toBeDefined();
    });

    it('rejects invalid token', () => {
      expect(() => service.resetPassword('invalid-token', 'ResetPass111!')).toThrow(/invalid/i);
    });

    it('rejects reused token', () => {
      seedUser(db, { email: 'reset@example.com' });
      const { token } = service.forgotPassword('reset@example.com');

      service.resetPassword(token, 'ResetPass111!');
      expect(() => service.resetPassword(token, 'ResetPass222!')).toThrow(/invalid/i);
    });

    it('revokes all sessions after reset', () => {
      const user = seedUser(db, { email: 'reset@example.com' });
      const login1 = service.login({ username: user.username, password: 'TestPass123!' });
      const { token } = service.forgotPassword('reset@example.com');

      service.resetPassword(token, 'ResetPass111!');

      expect(() => service.refreshToken(login1.refreshToken)).toThrow('Invalid credentials');
    });

    it('resets lockout on password reset', () => {
      seedUser(db, {
        username: 'locked',
        email: 'locked@example.com',
        failedLoginAttempts: 5,
        lockoutUntil: new Date(Date.now() + 30 * 60 * 1000),
      });
      const { token } = service.forgotPassword('locked@example.com');

      service.resetPassword(token, 'ResetPass111!');

      const updated = db.prepare('SELECT failed_login_attempts, lockout_until FROM users WHERE username = ?').get('locked') as any;
      expect(updated.failed_login_attempts).toBe(0);
      expect(updated.lockout_until).toBeNull();
    });
  });
});
