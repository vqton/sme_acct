import { Module } from '@nestjs/common';
import { DatabaseModule } from './common/database.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CompanyModule } from './company/company.module.js';
import { DepartmentModule } from './department/department.module.js';
import { AccountingModule } from './accounting/accounting.module.js';
import { AppLifecycleHook } from './common/lifecycle/app-lifecycle.js';
import { AppLoggerModule } from './integrations/logger.module.js';
import { AppHealthModule } from './integrations/health.module.js';
import { AppMetricsModule } from './integrations/metrics.module.js';
import { AppSentryModule } from './integrations/sentry.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { UserModule } from './user/user.module.js';
import { TaxModule } from './tax/tax.module.js';
import { OpeningBalanceModule } from './opening-balance/opening-balance.module.js';
import { I18nModule } from './common/i18n.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

@Module({
  imports: [
    AppLoggerModule,
    AppHealthModule,
    AppMetricsModule,
    AppSentryModule,
    DatabaseModule,
    I18nModule,
    AuthModule,
    CompanyModule,
    AccountingModule,
    DepartmentModule,
    UserModule,
    DashboardModule,
    TaxModule,
    OpeningBalanceModule,
  ],
  providers: [AppLifecycleHook, HttpExceptionFilter],
})
export class AppModule {}
