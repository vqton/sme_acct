import { Module } from '@nestjs/common';
import { DB_PROVIDER, DatabaseModule } from '../common/database.module.js';
import { TaxController } from './tax.controller.js';
import { TaxDeclarationService } from '../../application/TaxDeclarationService.js';
import { TaxPeriodService } from '../../application/TaxPeriodService.js';
import { TaxCalendarService } from '../../application/TaxCalendarService.js';
import { LedgerTaxExtractionService } from '../../application/LedgerTaxExtractionService.js';
import { TaxAuditTrailService } from '../../application/TaxAuditTrailService.js';
import { SQLiteTaxDeclarationRepository } from '../../infrastructure/database/TaxDeclarationRepository.js';
import { SQLiteTaxPeriodRepository } from '../../infrastructure/database/TaxPeriodRepository.js';
import { SQLiteAccountRepository } from '../../infrastructure/database/AccountRepository.js';
import { SQLiteLedgerRepository } from '../../infrastructure/database/LedgerRepository.js';
import Database from 'better-sqlite3';

@Module({
  imports: [DatabaseModule],
  controllers: [TaxController],
  providers: [
    {
      provide: SQLiteTaxDeclarationRepository,
      useFactory: (db: Database.Database) => new SQLiteTaxDeclarationRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: SQLiteTaxPeriodRepository,
      useFactory: (db: Database.Database) => new SQLiteTaxPeriodRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: SQLiteAccountRepository,
      useFactory: (db: Database.Database) => new SQLiteAccountRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: SQLiteLedgerRepository,
      useFactory: (db: Database.Database) => new SQLiteLedgerRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: TaxPeriodService,
      useFactory: (periodRepo: SQLiteTaxPeriodRepository) => new TaxPeriodService(periodRepo),
      inject: [SQLiteTaxPeriodRepository],
    },
    {
      provide: TaxDeclarationService,
      useFactory: (
        declRepo: SQLiteTaxDeclarationRepository,
        periodRepo: SQLiteTaxPeriodRepository,
      ) => new TaxDeclarationService(declRepo, periodRepo),
      inject: [SQLiteTaxDeclarationRepository, SQLiteTaxPeriodRepository],
    },
    {
      provide: TaxCalendarService,
      useFactory: () => new TaxCalendarService(),
    },
    {
      provide: LedgerTaxExtractionService,
      useFactory: (
        accountRepo: SQLiteAccountRepository,
        ledgerRepo: SQLiteLedgerRepository,
      ) => new LedgerTaxExtractionService(accountRepo, ledgerRepo),
      inject: [SQLiteAccountRepository, SQLiteLedgerRepository],
    },
    {
      provide: TaxAuditTrailService,
      useFactory: (db: Database.Database) => new TaxAuditTrailService(db),
      inject: [DB_PROVIDER],
    },
  ],
  exports: [TaxDeclarationService, TaxPeriodService, TaxCalendarService, LedgerTaxExtractionService, TaxAuditTrailService],
})
export class TaxModule {}
