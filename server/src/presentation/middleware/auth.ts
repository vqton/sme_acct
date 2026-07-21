import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../infrastructure/auth/jwt.js';
import { hasAnyPermission, hasAllPermissions, type Permission } from '../../domain/entities/Role.js';

export interface AuthenticatedUser {
  userId: string;
  username: string;
  roles: string[];
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing authorization header' });
    return;
  }

  try {
    const payload = verifyToken(header.slice(7));
    req.user = {
      userId: payload.userId,
      username: payload.username,
      roles: payload.roles ?? [],
    };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requirePermission(permission: Permission) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!hasAnyPermission(req.user.roles, permission)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}

export function requireAllPermissions(permissions: Permission[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!hasAllPermissions(req.user.roles, permissions)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}
