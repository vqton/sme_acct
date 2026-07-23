import { Module } from '@nestjs/common';
import { DB_PROVIDER, DatabaseModule } from '../common/database.module.js';
import { AccountingController } from './accounting.controller.js';
import { AccountingService } from '../../application/AccountingService.js';
import { SQLiteAccountRepository } from '../../infrastructure/database/AccountRepository.js';
import { SQLiteJournalEntryRepository } from '../../infrastructure/database/JournalEntryRepository.js';
import { SQLiteLedgerRepository } from '../../infrastructure/database/LedgerRepository.js';
import { SQLiteFiscalPeriodRepository } from '../../infrastructure/database/FiscalPeriodRepository.js';
import { SQLiteAuditLogRepository } from '../../infrastructure/database/AuditLogRepository.js';
import Database from 'better-sqlite3';

@Module({
  imports: [DatabaseModule],
  controllers: [AccountingController],
  providers: [
    {
      provide: SQLiteAccountRepository,
      useFactory: (db: Database.Database) => new SQLiteAccountRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: SQLiteJournalEntryRepository,
      useFactory: (db: Database.Database) => new SQLiteJournalEntryRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: SQLiteLedgerRepository,
      useFactory: (db: Database.Database) => new SQLiteLedgerRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: SQLiteFiscalPeriodRepository,
      useFactory: (db: Database.Database) => new SQLiteFiscalPeriodRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: SQLiteAuditLogRepository,
      useFactory: (db: Database.Database) => new SQLiteAuditLogRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: AccountingService,
      useFactory: (
        accountsRepo: SQLiteAccountRepository,
        journalRepo: SQLiteJournalEntryRepository,
        ledgerRepo: SQLiteLedgerRepository,
        fiscalRepo: SQLiteFiscalPeriodRepository,
        auditRepo: SQLiteAuditLogRepository,
      ) => new AccountingService({
        accounts: accountsRepo,
        journalEntries: journalRepo,
        ledger: ledgerRepo,
        fiscalPeriods: fiscalRepo,
        auditLogs: auditRepo,
      }),
      inject: [
        SQLiteAccountRepository,
        SQLiteJournalEntryRepository,
        SQLiteLedgerRepository,
        SQLiteFiscalPeriodRepository,
        SQLiteAuditLogRepository,
      ],
    },
  ],
  exports: [AccountingService],
})
export class AccountingModule {}
