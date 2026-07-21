import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { hasAnyPermission, type Permission } from '../../../domain/entities/Role.js';

export const PERMISSIONS_KEY = 'permissions';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const user = (req as any).user;
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    for (const permission of requiredPermissions) {
      if (!hasAnyPermission(user.roles, permission)) {
        throw new ForbiddenException('Insufficient permissions');
      }
    }

    return true;
  }
}
