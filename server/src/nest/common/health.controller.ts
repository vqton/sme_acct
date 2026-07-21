import { Controller, Get, Inject } from '@nestjs/common';
import { HealthCheckService, HealthCheck, MemoryHealthIndicator, DiskHealthIndicator } from '@nestjs/terminus';
import { SQLiteHealthIndicator } from '../integrations/sqlite.health.js';

@Controller()
export class HealthController {
  constructor(
    @Inject(HealthCheckService) private health: HealthCheckService,
    @Inject(SQLiteHealthIndicator) private dbHealth: SQLiteHealthIndicator,
    @Inject(MemoryHealthIndicator) private memoryHealth: MemoryHealthIndicator,
    @Inject(DiskHealthIndicator) private diskHealth: DiskHealthIndicator,
  ) {}

  @Get()
  root() {
    return {
      name: 'SME Accounting API (NestJS)',
      version: '0.1.0',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth/login | /api/auth/register',
        companies: '/api/companies',
      },
      client: 'http://localhost:5173',
    };
  }

  @Get('health')
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.dbHealth.isHealthy('database'),
      () => this.memoryHealth.checkHeap('memory_heap', 300 * 1024 * 1024),
      () => this.diskHealth.checkStorage('disk_storage', { thresholdPercent: 0.9, path: '/' }),
    ]);
  }
}
