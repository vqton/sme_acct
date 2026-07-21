import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
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
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
