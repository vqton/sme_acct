import { Module } from '@nestjs/common';
import { DB_PROVIDER, DatabaseModule } from '../common/database.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from '../../application/AuthService.js';
import { AuthorizationService } from '../../application/AuthorizationService.js';
import { SQLiteUserRepository } from '../../infrastructure/database/UserRepository.js';
import { SQLiteAuditLogRepository } from '../../infrastructure/database/AuditLogRepository.js';
import { SQLiteRefreshTokenRepository } from '../../infrastructure/database/RefreshTokenRepository.js';
import { SQLiteRoleRepository } from '../../infrastructure/database/RoleRepository.js';
import { SQLiteUserCompanyRepository } from '../../infrastructure/database/UserCompanyRepository.js';
import { SQLiteCompanyRepository } from '../../infrastructure/database/CompanyRepository.js';
import { SQLiteBackupCodeRepository } from '../../infrastructure/database/BackupCodeRepository.js';
import { SQLitePasswordHistoryRepository } from '../../infrastructure/database/PasswordHistoryRepository.js';
import { SQLitePasswordResetTokenRepository } from '../../infrastructure/database/PasswordResetTokenRepository.js';
import Database from 'better-sqlite3';

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [
    {
      provide: SQLiteUserRepository,
      useFactory: (db: Database.Database) => new SQLiteUserRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: SQLiteAuditLogRepository,
      useFactory: (db: Database.Database) => new SQLiteAuditLogRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: SQLiteRefreshTokenRepository,
      useFactory: (db: Database.Database) => new SQLiteRefreshTokenRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: SQLiteRoleRepository,
      useFactory: (db: Database.Database) => new SQLiteRoleRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: SQLiteUserCompanyRepository,
      useFactory: (db: Database.Database) => new SQLiteUserCompanyRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: SQLiteCompanyRepository,
      useFactory: (db: Database.Database) => new SQLiteCompanyRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: SQLiteBackupCodeRepository,
      useFactory: (db: Database.Database) => new SQLiteBackupCodeRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: SQLitePasswordHistoryRepository,
      useFactory: (db: Database.Database) => new SQLitePasswordHistoryRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: SQLitePasswordResetTokenRepository,
      useFactory: (db: Database.Database) => new SQLitePasswordResetTokenRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: AuthorizationService,
      useFactory: (roleRepo: SQLiteRoleRepository) => new AuthorizationService(roleRepo),
      inject: [SQLiteRoleRepository],
    },
    {
      provide: AuthService,
      useFactory: (
        userRepo: SQLiteUserRepository,
        auditRepo: SQLiteAuditLogRepository,
        refreshTokenRepo: SQLiteRefreshTokenRepository,
        roleRepo: SQLiteRoleRepository,
        passwordHistoryRepo: SQLitePasswordHistoryRepository,
        passwordResetTokenRepo: SQLitePasswordResetTokenRepository,
        userCompanyRepo: SQLiteUserCompanyRepository,
        companyRepo: SQLiteCompanyRepository,
        backupCodeRepo: SQLiteBackupCodeRepository,
      ) => new AuthService(userRepo, auditRepo, refreshTokenRepo, roleRepo, passwordHistoryRepo, passwordResetTokenRepo, userCompanyRepo, companyRepo, backupCodeRepo),
      inject: [
        SQLiteUserRepository,
        SQLiteAuditLogRepository,
        SQLiteRefreshTokenRepository,
        SQLiteRoleRepository,
        SQLitePasswordHistoryRepository,
        SQLitePasswordResetTokenRepository,
        SQLiteUserCompanyRepository,
        SQLiteCompanyRepository,
        SQLiteBackupCodeRepository,
      ],
    },
  ],
  exports: [AuthService, AuthorizationService],
})
export class AuthModule {}
