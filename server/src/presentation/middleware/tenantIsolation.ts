import { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.js';
import Database, { type Database as DatabaseType } from 'better-sqlite3';
import { getDb } from '../../infrastructure/database/connection.js';

export interface TenantRequest extends AuthRequest {
  companyId?: string;
  userCompanyIds?: string[];
}

export function tenantMiddleware(req: TenantRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const db = getDb();

  const rows = (db.prepare(
    'SELECT company_id FROM user_companies WHERE user_id = ? AND is_active = 1',
  ).all(req.user.userId) as { company_id: string }[]);

  req.userCompanyIds = rows.map((r) => r.company_id);

  const paramCompanyId = (req.params as Record<string, string>).companyId
    ?? (req.params as Record<string, string>).id;

  if (paramCompanyId) {
    if (!req.userCompanyIds.includes(paramCompanyId)) {
      res.status(403).json({ error: 'Access to this company is not allowed' });
      return;
    }
    req.companyId = paramCompanyId;
  }

  next();
}

export function requireCompanyAccess(req: TenantRequest, res: Response, next: NextFunction): void {
  if (!req.userCompanyIds) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const companyId = (req.params as Record<string, string>).companyId
    ?? (req.params as Record<string, string>).id;

  if (!companyId) {
    res.status(400).json({ error: 'Company ID is required' });
    return;
  }

  if (!req.userCompanyIds.includes(companyId)) {
    res.status(403).json({ error: 'Access to this company is not allowed' });
    return;
  }

  req.companyId = companyId;
  next();
}

export function filterByCompany<T extends { companyId?: string }>(
  items: T[],
  companyId: string | undefined,
): T[] {
  if (!companyId) return items;
  return items.filter((item) => item.companyId === companyId);
}
