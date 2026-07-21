import { Module } from '@nestjs/common';
import { DB_PROVIDER, DatabaseModule } from '../common/database.module.js';
import { CompanyController } from './company.controller.js';
import { CompanyUseCases } from '../../application/CompanyUseCases.js';
import { SQLiteCompanyRepository } from '../../infrastructure/database/CompanyRepository.js';
import { SQLLegalRepresentativeRepository } from '../../infrastructure/database/LegalRepresentativeRepository.js';
import { SQLiteCapitalContributorRepository } from '../../infrastructure/database/CapitalContributorRepository.js';
import { SQLiteBusinessLineRepository } from '../../infrastructure/database/BusinessLineRepository.js';
import { SQLiteCompanyBankAccountRepository } from '../../infrastructure/database/CompanyBankAccountRepository.js';
import Database from 'better-sqlite3';

@Module({
  imports: [DatabaseModule],
  controllers: [CompanyController],
  providers: [
    {
      provide: SQLiteCompanyRepository,
      useFactory: (db: Database.Database) => new SQLiteCompanyRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: SQLLegalRepresentativeRepository,
      useFactory: (db: Database.Database) => new SQLLegalRepresentativeRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: SQLiteCapitalContributorRepository,
      useFactory: (db: Database.Database) => new SQLiteCapitalContributorRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: SQLiteBusinessLineRepository,
      useFactory: (db: Database.Database) => new SQLiteBusinessLineRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: SQLiteCompanyBankAccountRepository,
      useFactory: (db: Database.Database) => new SQLiteCompanyBankAccountRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: CompanyUseCases,
      useFactory: (
        companyRepo: SQLiteCompanyRepository,
        legalRepsRepo: SQLLegalRepresentativeRepository,
        contributorsRepo: SQLiteCapitalContributorRepository,
        businessLinesRepo: SQLiteBusinessLineRepository,
        bankAccountsRepo: SQLiteCompanyBankAccountRepository,
      ) => new CompanyUseCases({
        company: companyRepo,
        legalReps: legalRepsRepo,
        capitalContributors: contributorsRepo,
        businessLines: businessLinesRepo,
        bankAccounts: bankAccountsRepo,
      }),
      inject: [
        SQLiteCompanyRepository,
        SQLLegalRepresentativeRepository,
        SQLiteCapitalContributorRepository,
        SQLiteBusinessLineRepository,
        SQLiteCompanyBankAccountRepository,
      ],
    },
  ],
})
export class CompanyModule {}
