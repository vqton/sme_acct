import { Router, Request, Response } from 'express';
import { AuthService } from '../../application/AuthService.js';
import { AuthorizationService } from '../../application/AuthorizationService.js';
import { SQLiteUserRepository } from '../../infrastructure/database/UserRepository.js';
import { SQLiteAuditLogRepository } from '../../infrastructure/database/AuditLogRepository.js';
import { SQLiteRefreshTokenRepository } from '../../infrastructure/database/RefreshTokenRepository.js';
import { SQLiteRoleRepository } from '../../infrastructure/database/RoleRepository.js';
import { SQLiteUserCompanyRepository } from '../../infrastructure/database/UserCompanyRepository.js';
import { SQLiteCompanyRepository } from '../../infrastructure/database/CompanyRepository.js';
import { SQLiteBackupCodeRepository } from '../../infrastructure/database/BackupCodeRepository.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { RateLimiter } from '../middleware/rateLimiter.js';

const userRepo = new SQLiteUserRepository();
const auditRepo = new SQLiteAuditLogRepository();
const refreshTokenRepo = new SQLiteRefreshTokenRepository();
const roleRepo = new SQLiteRoleRepository();
const authz = new AuthorizationService(roleRepo);
const userCompanyRepo = new SQLiteUserCompanyRepository();
const companyRepo = new SQLiteCompanyRepository();
const backupCodeRepo = new SQLiteBackupCodeRepository();
const service = new AuthService(userRepo, auditRepo, refreshTokenRepo, roleRepo, undefined, undefined, userCompanyRepo, companyRepo, backupCodeRepo);

const loginRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000,
  maxAttempts: 5,
});

const router = Router();

router.post('/login', (req: Request, res: Response) => {
  const clientIp = req.ip ?? req.socket.remoteAddress ?? 'unknown';

  if (!loginRateLimiter.isAllowed(clientIp)) {
    const retryAfter = loginRateLimiter.getRetryAfter(clientIp);
    res.status(429).json({
      error: 'Too many login attempts. Please try again later.',
      retryAfter,
    });
    return;
  }

  try {
    const ctx = { ipAddress: clientIp, userAgent: req.headers['user-agent'] ?? null };
    const result = service.login({
      username: req.body.username,
      password: req.body.password,
    }, ctx);
    res.json({ token: result.token, refreshToken: result.refreshToken, user: result.user, companies: result.companies });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Login failed';
    if (msg.includes('locked')) {
      res.status(423).json({ error: msg });
      return;
    }
    const status = msg === 'Account disabled' ? 403 : 401;
    res.status(status).json({ error: msg });
  }
});

router.post('/register', (req: Request, res: Response) => {
  try {
    const ctx = { ipAddress: req.ip ?? req.socket.remoteAddress ?? 'unknown', userAgent: req.headers['user-agent'] ?? null };
    const result = service.register({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      fullName: req.body.fullName,
    }, ctx);
    res.status(201).json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Registration failed';
    const status = msg.includes('already') ? 409 : 400;
    res.status(status).json({ error: msg });
  }
});

router.post('/refresh', (req: Request, res: Response) => {
  try {
    const ctx = { ipAddress: req.ip ?? req.socket.remoteAddress ?? 'unknown', userAgent: req.headers['user-agent'] ?? null };
    const result = service.refreshToken(req.body.refreshToken, ctx);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err instanceof Error ? err.message : 'Invalid token' });
  }
});

router.post('/change-password', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const ctx = { ipAddress: req.ip ?? req.socket.remoteAddress ?? 'unknown', userAgent: req.headers['user-agent'] ?? null };
    service.changePassword(req.user!.userId, req.body.oldPassword, req.body.newPassword, ctx);
    res.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    const status = msg.includes('Password') ? 400 : 401;
    res.status(status).json({ error: msg });
  }
});

router.post('/logout', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const ctx = { ipAddress: req.ip ?? req.socket.remoteAddress ?? 'unknown', userAgent: req.headers['user-agent'] ?? null };
    service.logout(req.user!.userId, ctx);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Logout failed' });
  }
});

router.get('/sessions', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const sessions = service.listActiveSessions(req.user!.userId);
    res.json({ sessions });
  } catch {
    res.status(500).json({ error: 'Failed to list sessions' });
  }
});

router.delete('/sessions/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const session = refreshTokenRepo.findById(req.params.id);
    if (!session || session.userId !== req.user!.userId) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    refreshTokenRepo.revoke(req.params.id);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Failed to revoke session' });
  }
});

router.delete('/sessions', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const ctx = { ipAddress: req.ip ?? req.socket.remoteAddress ?? 'unknown', userAgent: req.headers['user-agent'] ?? null };
    service.revokeAllSessions(req.user!.userId, ctx);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Failed to revoke sessions' });
  }
});

router.post('/forgot-password', (req: Request, res: Response) => {
  try {
    const result = service.forgotPassword(req.body.email);
    res.json({ ok: true, token: result.token || undefined });
  } catch {
    res.status(500).json({ error: 'Password reset request failed' });
  }
});

router.post('/reset-password', (req: Request, res: Response) => {
  try {
    const ctx = { ipAddress: req.ip ?? req.socket.remoteAddress ?? 'unknown', userAgent: req.headers['user-agent'] ?? null };
    service.resetPassword(req.body.token, req.body.newPassword, ctx);
    res.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    const status = msg.includes('Invalid') ? 400 : 500;
    res.status(status).json({ error: msg });
  }
});

router.post('/select-company', (req: Request, res: Response) => {
  try {
    const result = service.selectCompany(req.body.refreshToken, req.body.companyId);
    res.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Company selection failed';
    const status = msg.includes('not a member') ? 403 : 401;
    res.status(status).json({ error: msg });
  }
});

router.post('/2fa/setup', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const result = service.setupTwoFactor(req.user!.userId);
    res.json({ secret: result.secret, backupCodes: result.backupCodes });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : '2FA setup failed' });
  }
});

router.post('/2fa/verify', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    service.verifyAndEnableTwoFactor(req.user!.userId, req.body.code);
    res.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Verification failed';
    res.status(400).json({ error: msg });
  }
});

router.post('/2fa/verify-login', (req: Request, res: Response) => {
  try {
    const result = service.verifyTwoFactorLogin(req.body.tempToken, req.body.code);
    res.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Verification failed';
    res.status(401).json({ error: msg });
  }
});

router.post('/2fa/disable', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    service.disableTwoFactor(req.user!.userId, req.body.code);
    res.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Disable failed';
    res.status(400).json({ error: msg });
  }
});

export default router;
