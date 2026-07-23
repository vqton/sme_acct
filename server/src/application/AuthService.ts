import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import * as OTPAuth from 'otpauth';
import type { UserRepository } from '../domain/repositories/UserRepository.js';
import type { AuditLogRepository } from '../domain/repositories/AuditLogRepository.js';
import type { RefreshTokenRepository } from '../domain/repositories/RefreshTokenRepository.js';
import type { RoleRepository } from '../domain/repositories/RoleRepository.js';
import type { PasswordHistoryRepository } from '../domain/repositories/PasswordHistoryRepository.js';
import type { PasswordResetTokenRepository } from '../domain/repositories/PasswordResetTokenRepository.js';
import type { UserCompanyRepository } from '../domain/repositories/UserCompanyRepository.js';
import type { CompanyRepository } from '../domain/repositories/CompanyRepository.js';
import type { BackupCodeRepository } from '../domain/repositories/BackupCodeRepository.js';
import { generateToken, type TokenPayload } from '../infrastructure/auth/jwt.js';
import {
  InvalidCredentialsError,
  AccountDisabledError,
  AccountLockedError,
  UsernameTakenError,
  EmailTakenError,
  ValidationError,
  InvalidResetTokenError,
  NoCompaniesAssignedError,
  CompanyAccessError,
  InvalidTOTPError,
} from '../domain/errors/AuthErrors.js';
import type { RequestContext } from '../domain/entities/AuditLog.js';

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string | null;
  refreshToken: string;
  user: { id: number; username: string; fullName: string };
  companies: { id: number; name: string; role?: string }[];
  requires2FA?: boolean;
  tempToken?: string;
}

export interface TokenRefreshResult {
  token: string;
  refreshToken: string;
  user: { id: number; username: string; fullName: string };
  companyId?: number;
  companies?: { id: number; name: string; role?: string }[];
}

const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
};

const REFRESH_TOKEN_DAYS = 7;
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000;
const PASSWORD_HISTORY_LIMIT = 5;
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;

function validatePassword(password: string): void {
  if (password.length < PASSWORD_RULES.minLength) {
    throw new ValidationError(`Password must be at least ${PASSWORD_RULES.minLength} characters`);
  }
  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
    throw new ValidationError('Password must contain at least one uppercase letter');
  }
  if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
    throw new ValidationError('Password must contain at least one lowercase letter');
  }
  if (PASSWORD_RULES.requireNumber && !/\d/.test(password)) {
    throw new ValidationError('Password must contain at least one number');
  }
  if (PASSWORD_RULES.requireSpecial && !/[!@#$%^&*(),.?":{}|<>_]/.test(password)) {
    throw new ValidationError('Password must contain at least one special character');
  }
}

function generateRefreshToken(): { token: string; hash: string } {
  const token = crypto.randomBytes(48).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hash };
}

export class AuthService {
  constructor(
    private userRepo: UserRepository,
    private auditRepo?: AuditLogRepository,
    private refreshTokenRepo?: RefreshTokenRepository,
    private roleRepo?: RoleRepository,
    private passwordHistoryRepo?: PasswordHistoryRepository,
    private passwordResetTokenRepo?: PasswordResetTokenRepository,
    private userCompanyRepo?: UserCompanyRepository,
    private companyRepo?: CompanyRepository,
    private backupCodeRepo?: BackupCodeRepository,
  ) {}

  private createAccessToken(userId: number, username: string, companyId?: number, companyRole?: string): string {
    const roles = companyRole ? [companyRole] : (this.roleRepo?.getUserRoles(userId) ?? []);
    return generateToken({ userId, username, companyId, roles, jti: crypto.randomUUID() });
  }

  private audit(ctx: RequestContext | undefined, entry: { userId: number | null; action: string; resource: string | null; resourceId: number | null; detail: string | null }): void {
    this.auditRepo?.save({
      ...entry,
      ipAddress: ctx?.ipAddress ?? null,
      userAgent: ctx?.userAgent ?? null,
    });
  }

  register(input: RegisterInput, ctx?: RequestContext): { id: number; username: string; email: string; fullName: string } {
    const username = input.username.trim();
    const email = input.email.trim().toLowerCase();

    if (username.length < 3) {
      throw new ValidationError('Username must be at least 3 characters');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ValidationError('Invalid email format');
    }
    validatePassword(input.password);

    if (this.userRepo.findByUsername(username)) {
      throw new UsernameTakenError();
    }
    if (this.userRepo.findByEmail(email)) {
      throw new EmailTakenError();
    }

    const passwordHash = bcrypt.hashSync(input.password, 10);
    const user = this.userRepo.save({
      id: 0,
      username,
      email,
      fullName: input.fullName.trim(),
      passwordHash,
      isActive: true,
      twoFactorEnabled: false,
      failedLoginAttempts: 0,
      lockoutUntil: null,
      createdAt: new Date(),
    });

    this.audit(ctx, {
      userId: user.id,
      action: 'USER_REGISTERED',
      resource: 'user',
      resourceId: user.id,
      detail: `User ${user.username} registered`,
    });

    return { id: user.id, username: user.username, email: user.email, fullName: user.fullName };
  }

  login(input: LoginInput, ctx?: RequestContext): LoginResult {
    const user = this.userRepo.findByUsername(input.username.trim());
    if (!user) {
      this.audit(ctx, {
        userId: null,
        action: 'LOGIN_FAILED',
        resource: null,
        resourceId: null,
        detail: `Failed login for username: ${input.username}`,
      });
      throw new InvalidCredentialsError();
    }

    if (!user.isActive) {
      throw new AccountDisabledError();
    }

    if (user.lockoutUntil && user.lockoutUntil.getTime() > Date.now()) {
      const retryAfter = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 1000);
      throw new AccountLockedError(retryAfter);
    }

    const valid = bcrypt.compareSync(input.password, user.passwordHash);
    if (!valid) {
      const attempts = (user.failedLoginAttempts ?? 0) + 1;
      const lockoutUntil = attempts >= LOCKOUT_THRESHOLD
        ? new Date(Date.now() + LOCKOUT_DURATION_MS)
        : null;

      this.userRepo.save({
        ...user,
        failedLoginAttempts: attempts,
        lockoutUntil,
        updatedAt: new Date(),
      });

      this.audit(ctx, {
        userId: user.id,
        action: 'LOGIN_FAILED',
        resource: 'user',
        resourceId: user.id,
        detail: `Failed login attempt ${attempts}/${LOCKOUT_THRESHOLD} for user ${user.username}`,
      });

      throw new InvalidCredentialsError();
    }

    if (user.failedLoginAttempts > 0 || user.lockoutUntil) {
      this.userRepo.save({
        ...user,
        failedLoginAttempts: 0,
        lockoutUntil: null,
        updatedAt: new Date(),
      });
    }

    // Check if 2FA is enabled — return tempToken instead of real token
    if (user.twoFactorEnabled && user.totpSecret) {
      const jti = crypto.randomUUID();
      const tempToken = jwt.sign(
        { userId: user.id, username: user.username, purpose: '2fa', jti },
        process.env.JWT_SECRET!,
        { expiresIn: '5m', issuer: 'sme-acct', audience: 'sme-acct-client' },
      );

      this.audit(ctx, {
        userId: user.id,
        action: 'USER_LOGIN',
        resource: 'user',
        resourceId: user.id,
        detail: `User ${user.username} logged in, 2FA required`,
      });

      return {
        token: null,
        refreshToken: '',
        user: { id: user.id, username: user.username, fullName: user.fullName },
        companies: [],
        requires2FA: true,
        tempToken,
      };
    }

    this.audit(ctx, {
      userId: user.id,
      action: 'USER_LOGIN',
      resource: 'user',
      resourceId: user.id,
      detail: `User ${user.username} logged in`,
    });

    if (!this.userCompanyRepo) {
      const token = this.createAccessToken(user.id, user.username);
      const refreshToken = this.createRefreshToken(user.id, undefined, ctx);
      return {
        token,
        refreshToken,
        user: { id: user.id, username: user.username, fullName: user.fullName },
        companies: [],
      };
    }

    const userCompanies = this.userCompanyRepo.findByUserId(user.id).filter((uc) => uc.isActive);

    if (userCompanies.length === 0) {
      throw new NoCompaniesAssignedError();
    }

    const companies = userCompanies.map((uc) => {
      const company = this.companyRepo?.findById(uc.companyId);
      return { id: uc.companyId, name: company?.name ?? 'Unknown', role: uc.role };
    });

    if (userCompanies.length === 1) {
      const companyId = userCompanies[0].companyId;
      const companyRole = userCompanies[0].role;
      const token = this.createAccessToken(user.id, user.username, companyId, companyRole);
      const refreshToken = this.createRefreshToken(user.id, companyId, ctx);
      return {
        token,
        refreshToken,
        user: { id: user.id, username: user.username, fullName: user.fullName },
        companies,
      };
    }

    // Multiple companies — return list, no token yet
    const refreshToken = this.createRefreshToken(user.id, undefined, ctx);
    return {
      token: null,
      refreshToken,
      user: { id: user.id, username: user.username, fullName: user.fullName },
      companies,
    };
  }

  selectCompany(refreshTokenStr: string, companyId: number): TokenRefreshResult {
    if (!this.refreshTokenRepo) {
      throw new Error('Refresh token repository not configured');
    }

    const hash = crypto.createHash('sha256').update(refreshTokenStr).digest('hex');
    const stored = this.refreshTokenRepo.findValid(hash);
    if (!stored) {
      throw new InvalidCredentialsError();
    }

    const user = this.userRepo.findById(stored.userId);
    if (!user || !user.isActive) {
      throw new InvalidCredentialsError();
    }

    let companyRole: string | undefined;
    if (this.userCompanyRepo) {
      const membership = this.userCompanyRepo.findByUserIdAndCompanyId(user.id, companyId);
      if (!membership || !membership.isActive) {
        throw new CompanyAccessError(companyId);
      }
      companyRole = membership.role;
    }

    const token = this.createAccessToken(user.id, user.username, companyId, companyRole);
    const newRefreshToken = this.createRefreshToken(user.id, companyId);

    this.refreshTokenRepo.revoke(stored.id);

    const userCompanies = this.userCompanyRepo
      ? this.userCompanyRepo.findByUserId(user.id).filter((uc) => uc.isActive)
      : [];
    const companies = userCompanies.map((uc) => {
      const company = this.companyRepo?.findById(uc.companyId);
      return { id: uc.companyId, name: company?.name ?? 'Unknown', role: uc.role };
    });

    return {
      token,
      refreshToken: newRefreshToken,
      user: { id: user.id, username: user.username, fullName: user.fullName },
      companyId,
      companies,
    };
  }

  refreshToken(refreshTokenStr: string, ctx?: RequestContext): TokenRefreshResult {
    if (!this.refreshTokenRepo) {
      throw new Error('Refresh token repository not configured');
    }

    const hash = crypto.createHash('sha256').update(refreshTokenStr).digest('hex');
    const stored = this.refreshTokenRepo.findValid(hash);
    if (!stored) {
      throw new InvalidCredentialsError();
    }

    this.refreshTokenRepo.revoke(stored.id);

    const user = this.userRepo.findById(stored.userId);
    if (!user || !user.isActive) {
      throw new InvalidCredentialsError();
    }

    const companyId = stored.companyId;
    let companyRole: string | undefined;
    if (companyId && this.userCompanyRepo) {
      const membership = this.userCompanyRepo.findByUserIdAndCompanyId(user.id, companyId);
      companyRole = membership?.role;
    }
    const token = this.createAccessToken(user.id, user.username, companyId, companyRole);
    const newRefreshToken = this.createRefreshToken(user.id, companyId);

    this.audit(ctx, {
      userId: user.id,
      action: 'TOKEN_REFRESHED',
      resource: 'user',
      resourceId: user.id,
      detail: `Token refreshed for user ${user.username}`,
    });

    return {
      token,
      refreshToken: newRefreshToken,
      user: { id: user.id, username: user.username, fullName: user.fullName },
      companyId,
    };
  }

  changePassword(userId: number, oldPassword: string, newPassword: string, ctx?: RequestContext): void {
    const user = this.userRepo.findById(userId);
    if (!user) throw new InvalidCredentialsError();

    const valid = bcrypt.compareSync(oldPassword, user.passwordHash);
    if (!valid) throw new InvalidCredentialsError();

    validatePassword(newPassword);

    if (this.passwordHistoryRepo) {
      const recentHashes = this.passwordHistoryRepo.getRecentHashes(userId, PASSWORD_HISTORY_LIMIT);
      const isReused = recentHashes.some((hash) => bcrypt.compareSync(newPassword, hash));
      if (isReused) {
        throw new ValidationError(`Cannot reuse last ${PASSWORD_HISTORY_LIMIT} passwords`);
      }
    }

    const newHash = bcrypt.hashSync(newPassword, 10);

    this.passwordHistoryRepo?.save({ userId, passwordHash: user.passwordHash });

    this.userRepo.save({
      ...user,
      passwordHash: newHash,
      updatedAt: new Date(),
    });

    this.refreshTokenRepo?.revokeAllForUser(userId);

    this.audit(ctx, {
      userId,
      action: 'PASSWORD_CHANGED',
      resource: 'user',
      resourceId: userId,
      detail: `Password changed for user ${user.username}`,
    });
  }

  revokeAllSessions(userId: number, ctx?: RequestContext): void {
    this.refreshTokenRepo?.revokeAllForUser(userId);

    this.audit(ctx, {
      userId,
      action: 'SESSIONS_REVOKED',
      resource: 'user',
      resourceId: userId,
      detail: 'All sessions revoked',
    });
  }

  listActiveSessions(userId: number): { id: number; ipAddress?: string; userAgent?: string; deviceName?: string; createdAt: Date; lastUsedAt?: Date }[] {
    if (!this.refreshTokenRepo) return [];
    return this.refreshTokenRepo.findAllActiveForUser(userId).map((t) => ({
      id: t.id,
      ipAddress: t.ipAddress,
      userAgent: t.userAgent,
      deviceName: t.deviceName,
      createdAt: t.createdAt,
      lastUsedAt: t.lastUsedAt,
    }));
  }

  revokeSession(userId: number, refreshTokenStr: string, ctx?: RequestContext): void {
    if (!this.refreshTokenRepo) return;

    const hash = crypto.createHash('sha256').update(refreshTokenStr).digest('hex');
    const token = this.refreshTokenRepo.findValid(hash);
    if (!token || token.userId !== userId) return;

    this.refreshTokenRepo.revoke(token.id);

    this.audit(ctx, {
      userId,
      action: 'SESSION_REVOKED',
      resource: 'user',
      resourceId: userId,
      detail: `Session ${token.id} revoked`,
    });
  }

  logout(userId: number, ctx?: RequestContext): void {
    this.refreshTokenRepo?.revokeAllForUser(userId);

    this.audit(ctx, {
      userId,
      action: 'USER_LOGOUT',
      resource: 'user',
      resourceId: userId,
      detail: 'User logged out',
    });
  }

  forgotPassword(email: string): { token: string } {
    if (!this.passwordResetTokenRepo) {
      throw new Error('Password reset not configured');
    }

    const user = this.userRepo.findByEmail(email.trim().toLowerCase());
    if (!user) {
      return { token: '' };
    }

    this.passwordResetTokenRepo.deleteExpired();

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    this.passwordResetTokenRepo.save({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + RESET_TOKEN_EXPIRY_MS),
    });

    this.audit(undefined, {
      userId: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
      resource: 'user',
      resourceId: user.id,
      detail: `Password reset requested for ${user.email}`,
    });

    return { token: rawToken };
  }

  resetPassword(token: string, newPassword: string, ctx?: RequestContext): void {
    if (!this.passwordResetTokenRepo) {
      throw new Error('Password reset not configured');
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const stored = this.passwordResetTokenRepo.findValid(tokenHash);
    if (!stored) {
      throw new InvalidResetTokenError();
    }

    validatePassword(newPassword);

    const user = this.userRepo.findById(stored.userId);
    if (!user) {
      throw new InvalidResetTokenError();
    }

    const newHash = bcrypt.hashSync(newPassword, 10);

    this.passwordHistoryRepo?.save({ userId: user.id, passwordHash: user.passwordHash });

    this.userRepo.save({
      ...user,
      passwordHash: newHash,
      failedLoginAttempts: 0,
      lockoutUntil: null,
      updatedAt: new Date(),
    });

    this.passwordResetTokenRepo.markUsed(stored.id);

    this.refreshTokenRepo?.revokeAllForUser(user.id);

    this.audit(ctx, {
      userId: user.id,
      action: 'PASSWORD_RESET_COMPLETED',
      resource: 'user',
      resourceId: user.id,
      detail: `Password reset completed for user ${user.username}`,
    });
  }

  // --- 2FA / TOTP ---

  setupTwoFactor(userId: number): { secret: string; backupCodes: string[] } {
    const user = this.userRepo.findById(userId);
    if (!user) throw new InvalidCredentialsError();

    const totp = new OTPAuth.TOTP({
      issuer: 'SME Accounting',
      label: user.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    });

    const secret = totp.secret.base32;

    // Generate 10 backup codes
    const backupCodes: string[] = [];
    const backupCodeHashes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      backupCodes.push(code);
      backupCodeHashes.push(crypto.createHash('sha256').update(code).digest('hex'));
    }

    // Store secret but don't enable yet
    this.userRepo.save({ ...user, totpSecret: secret, updatedAt: new Date() });

    // Store backup codes
    if (this.backupCodeRepo) {
      this.backupCodeRepo.deleteAllForUser(userId);
      this.backupCodeRepo.savemany(userId, backupCodeHashes);
    }

    return { secret, backupCodes };
  }

  verifyAndEnableTwoFactor(userId: number, totpCode: string): void {
    const user = this.userRepo.findById(userId);
    if (!user || !user.totpSecret) throw new InvalidCredentialsError();

    const totp = new OTPAuth.TOTP({
      issuer: 'SME Accounting',
      label: user.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(user.totpSecret),
    });

    const delta = totp.validate({ token: totpCode, window: 1 });
    if (delta === null) throw new InvalidTOTPError();

    this.userRepo.save({ ...user, twoFactorEnabled: true, updatedAt: new Date() });

    this.audit(undefined, {
      userId,
      action: 'TWO_FACTOR_ENABLED',
      resource: 'user',
      resourceId: userId,
      detail: '2FA/TOTP enabled',
    });
  }

  verifyTwoFactorLogin(tempToken: string, totpCodeOrBackup: string): TokenRefreshResult {
    let payload: { userId: number; purpose: string };
    try {
      payload = jwt.verify(tempToken, process.env.JWT_SECRET!, { issuer: 'sme-acct', audience: 'sme-acct-client' }) as { userId: number; purpose: string };
    } catch {
      throw new InvalidCredentialsError();
    }

    if (payload.purpose !== '2fa') throw new InvalidCredentialsError();

    const user = this.userRepo.findById(payload.userId);
    if (!user || !user.totpSecret) throw new InvalidCredentialsError();

    // Try TOTP first
    const totp = new OTPAuth.TOTP({
      issuer: 'SME Accounting',
      label: user.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(user.totpSecret),
    });

    const delta = totp.validate({ token: totpCodeOrBackup, window: 1 });
    if (delta !== null) {
      // Valid TOTP — complete login
      return this.completeLogin(user);
    }

    // Try backup code (uppercased, SHA-256 matched)
    if (this.backupCodeRepo) {
      const codeHash = crypto.createHash('sha256').update(totpCodeOrBackup.toUpperCase()).digest('hex');
      const backupCode = this.backupCodeRepo.findValid(user.id, codeHash);
      if (backupCode) {
        this.backupCodeRepo.markUsed(backupCode.id);
        return this.completeLogin(user);
      }
    }

    throw new InvalidTOTPError();
  }

  disableTwoFactor(userId: number, totpCode: string): void {
    const user = this.userRepo.findById(userId);
    if (!user || !user.totpSecret) throw new InvalidCredentialsError();

    const totp = new OTPAuth.TOTP({
      issuer: 'SME Accounting',
      label: user.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(user.totpSecret),
    });

    const delta = totp.validate({ token: totpCode, window: 1 });
    if (delta === null) throw new InvalidTOTPError();

    this.userRepo.save({ ...user, twoFactorEnabled: false, totpSecret: undefined, updatedAt: new Date() });

    this.audit(undefined, {
      userId,
      action: 'TWO_FACTOR_DISABLED',
      resource: 'user',
      resourceId: userId,
      detail: '2FA/TOTP disabled',
    });
  }

  private completeLogin(user: { id: number; username: string; fullName: string; totpSecret?: string }): TokenRefreshResult {
    // Re-fetch full user to get company info
    const fullUser = this.userRepo.findById(user.id);
    if (!fullUser) throw new InvalidCredentialsError();

    const userCompanies = this.userCompanyRepo
      ? this.userCompanyRepo.findByUserId(user.id).filter((uc) => uc.isActive)
      : [];

    const companyId = userCompanies.length === 1 ? userCompanies[0].companyId : undefined;
    const token = this.createAccessToken(user.id, user.username, companyId);
    const refreshToken = this.createRefreshToken(user.id, companyId);

    return {
      token,
      refreshToken,
      user: { id: user.id, username: user.username, fullName: user.fullName },
      companyId,
    };
  }

  private createRefreshToken(userId: number, companyId?: number, ctx?: RequestContext): string {
    const { token, hash } = generateRefreshToken();
    this.refreshTokenRepo?.save({
      id: 0,
      userId,
      companyId,
      tokenHash: hash,
      ipAddress: ctx?.ipAddress ?? undefined,
      userAgent: ctx?.userAgent ?? undefined,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_DAYS * 86400000),
      createdAt: new Date(),
      revokedAt: null,
    });
    return token;
  }
}
