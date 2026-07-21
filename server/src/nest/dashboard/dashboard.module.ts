import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database.module.js';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';
import { DB_PROVIDER } from '../common/database.module.js';

@Module({
  imports: [DatabaseModule],
  controllers: [DashboardController],
  providers: [
    DashboardService,
  ],
})
export class DashboardModule {}
