import { Module } from '@nestjs/common';
import { DatabaseModule } from './common/database.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CompanyModule } from './company/company.module.js';
import { HealthController } from './common/health.controller.js';
import { AppLifecycleHook } from './common/lifecycle/app-lifecycle.js';

@Module({
  imports: [DatabaseModule, AuthModule, CompanyModule],
  controllers: [HealthController],
  providers: [AppLifecycleHook],
})
export class AppModule {}
