import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from '../common/health.controller.js';
import { SQLiteHealthIndicator } from './sqlite.health.js';
import { DatabaseModule } from '../common/database.module.js';

@Module({
  imports: [TerminusModule.forRoot(), DatabaseModule],
  controllers: [HealthController],
  providers: [SQLiteHealthIndicator],
})
export class AppHealthModule {}
