import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestDb } from '../../test/helpers/db.js';
import { seedUser } from '../../test/helpers/auth.js';
import { SQLiteRoleRepository } from '../../infrastructure/database/RoleRepository.js';
import { AuthorizationService } from '../../application/AuthorizationService.js';
import { AuthService } from '../../application/AuthService.js';
import { SQLiteUserRepository } from '../../infrastructure/database/UserRepository.js';
import { SQLiteAuditLogRepository } from '../../infrastructure/database/AuditLogRepository.js';
import { SQLiteRefreshTokenRepository } from '../../infrastructure/database/RefreshTokenRepository.js';

function mockReqRes() {
  const req: any = { headers: {}, user: undefined };
  const res: any = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  const next = vi.fn();
  return { req, res, next };
}

describe('authMiddleware', () => {
  it('passes valid token to next', async () => {
    const db = createTestDb();
    const user = seedUser(db);
    const userRepo = new SQLiteUserRepository(db);
    const auditRepo = new SQLiteAuditLogRepository(db);
    const refreshRepo = new SQLiteRefreshTokenRepository(db);
    const roleRepo = new SQLiteRoleRepository(db);
    const authz = new AuthorizationService(roleRepo);
    authz.assignRole(user.id, 'he-thong');

    const service = new AuthService(userRepo, auditRepo, refreshRepo, roleRepo);
    const { token } = service.login({ username: user.username, password: 'TestPass123!' });

    const { authMiddleware } = await import('./auth.js');
    const { req, res, next } = mockReqRes();
    req.headers.authorization = `Bearer ${token}`;

    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.userId).toBe(user.id);
  });

  it('rejects missing header', async () => {
    const { authMiddleware } = await import('./auth.js');
    const { req, res, next } = mockReqRes();

    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects invalid token', async () => {
    const { authMiddleware } = await import('./auth.js');
    const { req, res, next } = mockReqRes();
    req.headers.authorization = 'Bearer invalid-token';

    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('requirePermission', () => {
  it('allows ke-toan-tong-hop with company:read', async () => {
    const db = createTestDb();
    const roleRepo = new SQLiteRoleRepository(db);
    const user = seedUser(db);
    roleRepo.assignRole(user.id, 'ke-toan-tong-hop');

    const { requirePermission } = await import('./auth.js');
    const middleware = requirePermission('company:read');
    const { req, res, next } = mockReqRes();
    req.user = { userId: user.id, username: user.username, roles: ['ke-toan-tong-hop'] };

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('blocks ke-toan-vien from company:delete', async () => {
    const db = createTestDb();
    const roleRepo = new SQLiteRoleRepository(db);
    const user = seedUser(db);
    roleRepo.assignRole(user.id, 'ke-toan-vien');

    const { requirePermission } = await import('./auth.js');
    const middleware = requirePermission('company:delete');
    const { req, res, next } = mockReqRes();
    req.user = { userId: user.id, username: user.username, roles: ['ke-toan-vien'] };

    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('blocks unauthenticated request', async () => {
    const { requirePermission } = await import('./auth.js');
    const middleware = requirePermission('company:read');
    const { req, res, next } = mockReqRes();

    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('requireAllPermissions checks all permissions for he-thong', async () => {
    const db = createTestDb();
    const roleRepo = new SQLiteRoleRepository(db);
    const user = seedUser(db);
    roleRepo.assignRole(user.id, 'he-thong');

    const { requireAllPermissions } = await import('./auth.js');
    const middleware = requireAllPermissions(['company:read', 'company:create']);
    const { req, res, next } = mockReqRes();
    req.user = { userId: user.id, username: user.username, roles: ['he-thong'] };

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
