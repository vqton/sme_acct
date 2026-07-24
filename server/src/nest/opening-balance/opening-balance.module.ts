import { Module } from '@nestjs/common';
import { DB_PROVIDER, DatabaseModule } from '../common/database.module.js';
import { OpeningBalanceController } from './opening-balance.controller.js';
import { OpeningBalanceService } from '../../application/OpeningBalanceService.js';
import { SQLiteOpeningBalanceRepository } from '../../infrastructure/database/OpeningBalanceRepository.js';
import { SQLiteAccountRepository } from '../../infrastructure/database/AccountRepository.js';
import { SQLiteFiscalPeriodRepository } from '../../infrastructure/database/FiscalPeriodRepository.js';
import { SQLiteLedgerRepository } from '../../infrastructure/database/LedgerRepository.js';
import { SQLiteAuditLogRepository } from '../../infrastructure/database/AuditLogRepository.js';
import { SQLiteJournalEntryRepository } from '../../infrastructure/database/JournalEntryRepository.js';
import Database from 'better-sqlite3';

@Module({
  imports: [DatabaseModule],
  controllers: [OpeningBalanceController],
  providers: [
    {
      provide: SQLiteOpeningBalanceRepository,
      useFactory: (db: Database.Database) => new SQLiteOpeningBalanceRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: SQLiteAccountRepository,
      useFactory: (db: Database.Database) => new SQLiteAccountRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: SQLiteFiscalPeriodRepository,
      useFactory: (db: Database.Database) => new SQLiteFiscalPeriodRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: SQLiteLedgerRepository,
      useFactory: (db: Database.Database) => new SQLiteLedgerRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: SQLiteAuditLogRepository,
      useFactory: (db: Database.Database) => new SQLiteAuditLogRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: SQLiteJournalEntryRepository,
      useFactory: (db: Database.Database) => new SQLiteJournalEntryRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: OpeningBalanceService,
      useFactory: (
        obRepo: SQLiteOpeningBalanceRepository,
        accountRepo: SQLiteAccountRepository,
        periodRepo: SQLiteFiscalPeriodRepository,
        ledgerRepo: SQLiteLedgerRepository,
        auditRepo: SQLiteAuditLogRepository,
        journalRepo: SQLiteJournalEntryRepository,
      ) => new OpeningBalanceService(obRepo, accountRepo, periodRepo, ledgerRepo, auditRepo, journalRepo),
      inject: [
        SQLiteOpeningBalanceRepository,
        SQLiteAccountRepository,
        SQLiteFiscalPeriodRepository,
        SQLiteLedgerRepository,
        SQLiteAuditLogRepository,
        SQLiteJournalEntryRepository,
      ],
    },
  ],
  exports: [OpeningBalanceService],
})
export class OpeningBalanceModule {}
