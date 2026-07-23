import { describe, it, expect, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import { createTestDb, createTestRepos } from '../test/helpers/db.js';
import { seedUser } from '../test/helpers/auth.js';
import { AuthService } from './AuthService.js';
import { verifyToken } from '../infrastructure/auth/jwt.js';
import { SQLiteAuditLogRepository } from '../infrastructure/database/AuditLogRepository.js';
import { SQLiteRefreshTokenRepository } from '../infrastructure/database/RefreshTokenRepository.js';

describe('AuthService', () => {
  let db: ReturnType<typeof createTestDb>;
  let service: AuthService;

  beforeEach(() => {
    db = createTestDb();
    const { userRepo } = createTestRepos(db);
    const auditRepo = new SQLiteAuditLogRepository(db);
    const refreshTokenRepo = new SQLiteRefreshTokenRepository(db);
    service = new AuthService(userRepo, auditRepo, refreshTokenRepo);
  });

  describe('register', () => {
    it('creates user with valid input', () => {
      const result = service.register({
        username: 'newuser',
        email: 'new@example.com',
        password: 'StrongPass1!',
        fullName: 'New User',
      });

      expect(result.id).toBeDefined();
      expect(result.username).toBe('newuser');
      expect(result.email).toBe('new@example.com');
    });

    it('rejects duplicate username', () => {
      seedUser(db, { username: 'existing' });
      expect(() =>
        service.register({
          username: 'existing',
          email: 'other@example.com',
          password: 'StrongPass1!',
          fullName: 'User',
        }),
      ).toThrow('Username already taken');
    });

    it('rejects duplicate email', () => {
      seedUser(db, { email: 'dup@example.com' });
      expect(() =>
        service.register({
          username: 'newuser',
          email: 'dup@example.com',
          password: 'StrongPass1!',
          fullName: 'User',
        }),
      ).toThrow('Email already in use');
    });

    it('rejects short password', () => {
      expect(() =>
        service.register({
          username: 'newuser',
          email: 'new@example.com',
          password: 'Ab1!',
          fullName: 'User',
        }),
      ).toThrow('Password must be at least 8 characters');
    });

    it('rejects weak password (no uppercase)', () => {
      expect(() =>
        service.register({
          username: 'newuser',
          email: 'new@example.com',
          password: 'lowercase1!',
          fullName: 'User',
        }),
      ).toThrow(/uppercase/i);
    });

    it('rejects weak password (no number)', () => {
      expect(() =>
        service.register({
          username: 'newuser',
          email: 'new@example.com',
          password: 'Uppercase!',
          fullName: 'User',
        }),
      ).toThrow(/number/i);
    });

    it('rejects weak password (no special char)', () => {
      expect(() =>
        service.register({
          username: 'newuser',
          email: 'new@example.com',
          password: 'Uppercase1',
          fullName: 'User',
        }),
      ).toThrow(/special/i);
    });

    it('rejects short username', () => {
      expect(() =>
        service.register({
          username: 'ab',
          email: 'new@example.com',
          password: 'StrongPass1!',
          fullName: 'User',
        }),
      ).toThrow(/username.*3/i);
    });

    it('rejects invalid email', () => {
      expect(() =>
        service.register({
          username: 'newuser',
          email: 'notanemail',
          password: 'StrongPass1!',
          fullName: 'User',
        }),
      ).toThrow(/email/i);
    });

    it('hashes password with bcrypt', () => {
      service.register({
        username: 'newuser',
        email: 'new@example.com',
        password: 'StrongPass1!',
        fullName: 'User',
      });

      const stored = db.prepare('SELECT password_hash FROM users WHERE username = ?').get('newuser') as { password_hash: string };
      expect(stored.password_hash).not.toBe('StrongPass1!');
      expect(bcrypt.compareSync('StrongPass1!', stored.password_hash)).toBe(true);
    });

    it('logs audit entry on successful registration', () => {
      service.register({
        username: 'newuser',
        email: 'new@example.com',
        password: 'StrongPass1!',
        fullName: 'New User',
      });

      const logs = db.prepare('SELECT * FROM audit_logs').all() as any[];
      expect(logs.length).toBe(1);
      expect(logs[0].action).toBe('USER_REGISTERED');
    });
  });

  describe('login', () => {
    it('returns token and user for valid credentials', () => {
      const user = seedUser(db, { username: 'validuser' });

      const result = service.login({ username: 'validuser', password: 'TestPass123!' });

      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
      expect(result.user.id).toBe(user.id);
      expect(result.user.username).toBe('validuser');

      const payload = verifyToken(result.token!);
      expect(payload.userId).toBe(user.id);
    });

    it('rejects invalid username', () => {
      expect(() =>
        service.login({ username: 'nonexistent', password: 'TestPass123!' }),
      ).toThrow('Invalid credentials');
    });

    it('rejects wrong password', () => {
      seedUser(db, { username: 'validuser' });
      expect(() =>
        service.login({ username: 'validuser', password: 'WrongPass1!' }),
      ).toThrow('Invalid credentials');
    });

    it('rejects disabled account', () => {
      seedUser(db, { username: 'disableduser', isActive: false });
      expect(() =>
        service.login({ username: 'disableduser', password: 'TestPass123!' }),
      ).toThrow('Account disabled');
    });

    it('logs audit entry on successful login', () => {
      seedUser(db, { username: 'validuser' });
      service.login({ username: 'validuser', password: 'TestPass123!' });

      const logs = db.prepare('SELECT * FROM audit_logs').all() as any[];
      expect(logs.some((l: any) => l.action === 'USER_LOGIN')).toBe(true);
    });

    it('logs audit entry on failed login attempt', () => {
      seedUser(db, { username: 'validuser' });
      try { service.login({ username: 'validuser', password: 'WrongPass1!' }); } catch {}
      try { service.login({ username: 'validuser', password: 'WrongPass2!' }); } catch {}

      const failedLogs = db.prepare('SELECT * FROM audit_logs WHERE action = ?').all('LOGIN_FAILED') as any[];
      expect(failedLogs.length).toBe(2);
    });
  });

  describe('logout', () => {
    it('revokes all refresh tokens for user', () => {
      const user = seedUser(db, { username: 'logoutuser' });
      const login1 = service.login({ username: 'logoutuser', password: 'TestPass123!' });
      const login2 = service.login({ username: 'logoutuser', password: 'TestPass123!' });

      service.logout(user.id);

      expect(() => service.refreshToken(login1.refreshToken)).toThrow('Invalid credentials');
      expect(() => service.refreshToken(login2.refreshToken)).toThrow('Invalid credentials');
    });

    it('logs USER_LOGOUT audit event', () => {
      const user = seedUser(db, { username: 'logoutuser' });
      service.login({ username: 'logoutuser', password: 'TestPass123!' });

      service.logout(user.id);

      const logs = db.prepare('SELECT * FROM audit_logs WHERE action = ?').all('USER_LOGOUT') as any[];
      expect(logs.length).toBe(1);
      expect(logs[0].user_id).toBe(user.id);
    });

    it('does not throw for non-existent user', () => {
      expect(() => service.logout(9999)).not.toThrow();
    });
  });

  describe('account lockout', () => {
    it('increments failed login attempts on wrong password', () => {
      seedUser(db, { username: 'lockuser' });
      try { service.login({ username: 'lockuser', password: 'Wrong1!' }); } catch {}

      const updated = db.prepare('SELECT failed_login_attempts FROM users WHERE username = ?').get('lockuser') as { failed_login_attempts: number };
      expect(updated.failed_login_attempts).toBe(1);
    });

    it('locks account after 5 failed attempts', () => {
      seedUser(db, { username: 'lockuser' });
      for (let i = 0; i < 5; i++) {
        try { service.login({ username: 'lockuser', password: `Wrong${i}!` }); } catch {}
      }

      const updated = db.prepare('SELECT failed_login_attempts, lockout_until FROM users WHERE username = ?').get('lockuser') as { failed_login_attempts: number; lockout_until: string | null };
      expect(updated.failed_login_attempts).toBe(5);
      expect(updated.lockout_until).not.toBeNull();
    });

    it('rejects login when account is locked', () => {
      seedUser(db, {
        username: 'lockuser',
        failedLoginAttempts: 5,
        lockoutUntil: new Date(Date.now() + 30 * 60 * 1000),
      });

      expect(() => service.login({ username: 'lockuser', password: 'TestPass123!' })).toThrow(/locked/i);
    });

    it('allows login after lockout expires', () => {
      seedUser(db, {
        username: 'lockuser',
        failedLoginAttempts: 5,
        lockoutUntil: new Date(Date.now() - 1000),
      });

      const result = service.login({ username: 'lockuser', password: 'TestPass123!' });
      expect(result.token).toBeDefined();
    });

    it('resets failed attempts on successful login', () => {
      seedUser(db, { username: 'lockuser', failedLoginAttempts: 3 });
      service.login({ username: 'lockuser', password: 'TestPass123!' });

      const updated = db.prepare('SELECT failed_login_attempts, lockout_until FROM users WHERE username = ?').get('lockuser') as { failed_login_attempts: number; lockout_until: string | null };
      expect(updated.failed_login_attempts).toBe(0);
      expect(updated.lockout_until).toBeNull();
    });
    it('captures IP address and user agent in audit log', () => {
      seedUser(db, { username: 'audituser' });
      service.login(
        { username: 'audituser', password: 'TestPass123!' },
        { ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0' },
      );

      const logs = db.prepare('SELECT * FROM audit_logs WHERE action = ?').all('USER_LOGIN') as any[];
      expect(logs.length).toBe(1);
      expect(logs[0].ip_address).toBe('192.168.1.100');
      expect(logs[0].user_agent).toBe('Mozilla/5.0');
    });
  });
});
