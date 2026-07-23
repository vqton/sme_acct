import { describe, it, expect, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import * as OTPAuth from 'otpauth';
import { createTestDb } from '../test/helpers/db.js';
import { seedUser } from '../test/helpers/auth.js';
import { AuthService } from './AuthService.js';
import { verifyToken } from '../infrastructure/auth/jwt.js';
import { SQLiteAuditLogRepository } from '../infrastructure/database/AuditLogRepository.js';
import { SQLiteRefreshTokenRepository } from '../infrastructure/database/RefreshTokenRepository.js';
import { SQLiteUserCompanyRepository } from '../infrastructure/database/UserCompanyRepository.js';
import { SQLiteCompanyRepository } from '../infrastructure/database/CompanyRepository.js';
import { SQLiteUserRepository } from '../infrastructure/database/UserRepository.js';
import { SQLiteBackupCodeRepository } from '../infrastructure/database/BackupCodeRepository.js';
import type { Company } from '../domain/entities/Company.js';
import { CompanyStatus } from '../domain/entities/Company.js';

describe('2FA / TOTP', () => {
  let db: ReturnType<typeof createTestDb>;
  let service: AuthService;
  let userRepo: SQLiteUserRepository;
  let companyRepo: SQLiteCompanyRepository;
  let userCompanyRepo: SQLiteUserCompanyRepository;

  let nextCompanyId = 1;
  function seedCompany(overrides?: Partial<Company>): Company {
    const id = overrides?.id ?? nextCompanyId++;
    const company: Company = {
      id,
      name: overrides?.name ?? 'Test Company',
      status: CompanyStatus.Active,
      createdAt: new Date(),
      ...overrides,
    };
    companyRepo.save(company);
    return company;
  }

  function makeTOTP(secret: string): string {
    const totp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(secret) });
    return totp.generate();
  }

  beforeEach(() => {
    db = createTestDb();
    userRepo = new SQLiteUserRepository(db);
    companyRepo = new SQLiteCompanyRepository(db);
    userCompanyRepo = new SQLiteUserCompanyRepository(db);
    const auditRepo = new SQLiteAuditLogRepository(db);
    const refreshTokenRepo = new SQLiteRefreshTokenRepository(db);
    const backupCodeRepo = new SQLiteBackupCodeRepository(db);

    service = new AuthService(
      userRepo,
      auditRepo,
      refreshTokenRepo,
      undefined,
      undefined,
      undefined,
      userCompanyRepo,
      companyRepo,
      backupCodeRepo,
    );
  });

  describe('setupTwoFactor', () => {
    it('generates a TOTP secret and returns provisioning URI', () => {
      const user = seedUser(db, { username: 'alice2fa' });
      const result = service.setupTwoFactor(user.id);

      expect(result.secret).toBeDefined();
      expect(result.secret.length).toBeGreaterThan(0);
      expect(result.backupCodes).toBeDefined();
      expect(result.backupCodes.length).toBe(10);
    });

    it('persists the secret on the user', () => {
      const user = seedUser(db, { username: 'bob2fa' });
      service.setupTwoFactor(user.id);

      const updated = userRepo.findById(user.id);
      expect(updated?.totpSecret).toBeDefined();
      expect(updated?.twoFactorEnabled).toBe(false); // not enabled until verified
    });
  });

  describe('verifyAndEnableTwoFactor', () => {
    it('enables 2FA when valid TOTP code is provided', () => {
      const user = seedUser(db, { username: 'carol2fa' });
      const setup = service.setupTwoFactor(user.id);

      service.verifyAndEnableTwoFactor(user.id, makeTOTP(setup.secret));

      const updated = userRepo.findById(user.id);
      expect(updated?.twoFactorEnabled).toBe(true);
    });

    it('rejects invalid TOTP code', () => {
      const user = seedUser(db, { username: 'dave2fa' });
      const setup = service.setupTwoFactor(user.id);

      expect(() => service.verifyAndEnableTwoFactor(user.id, '000000')).toThrow('Invalid verification code');
    });
  });

  describe('login with 2FA', () => {
    it('returns tempToken when 2FA is enabled', () => {
      const user = seedUser(db, { username: 'eve2fa' });
      const company = seedCompany({ name: 'EveCo' });
      userCompanyRepo.create({ userId: user.id, companyId: company.id, isActive: true, joinedAt: new Date() });

      const setup = service.setupTwoFactor(user.id);
      service.verifyAndEnableTwoFactor(user.id, makeTOTP(setup.secret));

      const result = service.login({ username: 'eve2fa', password: 'TestPass123!' });

      expect(result.token).toBeNull();
      expect(result.requires2FA).toBe(true);
      expect(result.tempToken).toBeDefined();
    });

    it('completes login with valid TOTP code via verifyTwoFactorLogin', () => {
      const user = seedUser(db, { username: 'frank2fa' });
      const company = seedCompany({ name: 'FrankCo' });
      userCompanyRepo.create({ userId: user.id, companyId: company.id, isActive: true, joinedAt: new Date() });

      const setup = service.setupTwoFactor(user.id);
      service.verifyAndEnableTwoFactor(user.id, makeTOTP(setup.secret));

      const loginResult = service.login({ username: 'frank2fa', password: 'TestPass123!' });
      expect(loginResult.tempToken).toBeDefined();

      const finalResult = service.verifyTwoFactorLogin(loginResult.tempToken!, makeTOTP(setup.secret));

      expect(finalResult.token).toBeDefined();
      expect(finalResult.token).not.toBeNull();
      const payload = verifyToken(finalResult.token!);
      expect(payload.userId).toBe(user.id);
    });

    it('rejects invalid TOTP during login verification', () => {
      const user = seedUser(db, { username: 'grace2fa' });
      const company = seedCompany({ name: 'GraceCo' });
      userCompanyRepo.create({ userId: user.id, companyId: company.id, isActive: true, joinedAt: new Date() });

      const setup = service.setupTwoFactor(user.id);
      service.verifyAndEnableTwoFactor(user.id, makeTOTP(setup.secret));

      const loginResult = service.login({ username: 'grace2fa', password: 'TestPass123!' });

      expect(() => service.verifyTwoFactorLogin(loginResult.tempToken!, '000000')).toThrow();
    });
  });

  describe('backup codes', () => {
    it('can be used as TOTP alternative', () => {
      const user = seedUser(db, { username: 'hank2fa' });
      const company = seedCompany({ name: 'HankCo' });
      userCompanyRepo.create({ userId: user.id, companyId: company.id, isActive: true, joinedAt: new Date() });

      const setup = service.setupTwoFactor(user.id);
      service.verifyAndEnableTwoFactor(user.id, makeTOTP(setup.secret));

      const loginResult = service.login({ username: 'hank2fa', password: 'TestPass123!' });

      // Use first backup code
      const finalResult = service.verifyTwoFactorLogin(loginResult.tempToken!, setup.backupCodes[0]);
      expect(finalResult.token).toBeDefined();

      // Same backup code should not work again
      const loginResult2 = service.login({ username: 'hank2fa', password: 'TestPass123!' });
      expect(() => service.verifyTwoFactorLogin(loginResult2.tempToken!, setup.backupCodes[0])).toThrow();
    });
  });

  describe('disableTwoFactor', () => {
    it('disables 2FA when valid TOTP is provided', () => {
      const user = seedUser(db, { username: 'ivan2fa' });
      const setup = service.setupTwoFactor(user.id);
      service.verifyAndEnableTwoFactor(user.id, makeTOTP(setup.secret));

      service.disableTwoFactor(user.id, makeTOTP(setup.secret));

      const updated = userRepo.findById(user.id);
      expect(updated?.twoFactorEnabled).toBe(false);
      expect(updated?.totpSecret).toBeUndefined();
    });

    it('rejects invalid TOTP when disabling', () => {
      const user = seedUser(db, { username: 'judy2fa' });
      const setup = service.setupTwoFactor(user.id);
      service.verifyAndEnableTwoFactor(user.id, makeTOTP(setup.secret));

      expect(() => service.disableTwoFactor(user.id, '000000')).toThrow();
    });
  });
});
