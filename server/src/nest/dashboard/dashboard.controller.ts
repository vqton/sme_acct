import { Controller, Get, UseGuards, Inject } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard.js';
import { PermissionGuard } from '../common/guards/permission.guard.js';
import { Permissions } from '../common/guards/permissions.decorator.js';
import { DashboardService } from './dashboard.service.js';

@Controller('dashboard')
@UseGuards(AuthGuard, PermissionGuard)
export class DashboardController {
  constructor(@Inject(DashboardService) private readonly service: DashboardService) {}

  @Get()
  @Permissions('company:read')
  getDashboard() {
    return this.service.getDashboard();
  }
}
