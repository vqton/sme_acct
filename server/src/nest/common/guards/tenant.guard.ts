import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException, Inject } from '@nestjs/common';
import { Request } from 'express';
import { DB_PROVIDER } from '../database.module.js';
import type Database from 'better-sqlite3';

export interface TenantRequest extends Request {
  user?: { userId: string; username: string; roles: string[] };
  companyId?: string;
  userCompanyIds?: string[];
}

@Injectable()
export class TenantGuard implements CanActivate {
  private stmt: Database.Statement;

  constructor(@Inject(DB_PROVIDER) private readonly db: Database.Database) {
    this.stmt = db.prepare('SELECT company_id FROM user_companies WHERE user_id = ? AND is_active = 1');
  }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<TenantRequest>();
    const user = req.user;
    if (!user) throw new UnauthorizedException('Authentication required');

    const rows = this.stmt.all(user.userId) as { company_id: string }[];
    req.userCompanyIds = rows.map((r) => r.company_id);

    const companyId = (req.params as Record<string, string>).companyId
      ?? (req.params as Record<string, string>).id;

    if (companyId) {
      if (!req.userCompanyIds.includes(companyId)) {
        throw new ForbiddenException('Access to this company is not allowed');
      }
      req.companyId = companyId;
    }

    return true;
  }
}
