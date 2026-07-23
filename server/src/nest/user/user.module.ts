import { Module } from '@nestjs/common';
import { DB_PROVIDER, DatabaseModule } from '../common/database.module.js';
import { UserController } from './user.controller.js';
import { UserManagementService } from '../../application/UserManagementService.js';
import { UserGroupService } from '../../application/UserGroupService.js';
import { SQLiteUserRepository } from '../../infrastructure/database/UserRepository.js';
import { SQLiteUserProfileRepository } from '../../infrastructure/database/UserProfileRepository.js';
import { SQLiteUserGroupRepository } from '../../infrastructure/database/UserGroupRepository.js';
import { SQLiteUserCompanyRepository } from '../../infrastructure/database/UserCompanyRepository.js';
import { SQLiteRoleRepository } from '../../infrastructure/database/RoleRepository.js';
import Database from 'better-sqlite3';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [
    {
      provide: SQLiteUserRepository,
      useFactory: (db: Database.Database) => new SQLiteUserRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: SQLiteUserProfileRepository,
      useFactory: (db: Database.Database) => new SQLiteUserProfileRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: SQLiteUserGroupRepository,
      useFactory: (db: Database.Database) => new SQLiteUserGroupRepository(db),
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
      provide: UserManagementService,
      useFactory: (
        userRepo: SQLiteUserRepository,
        profileRepo: SQLiteUserProfileRepository,
        userCompanyRepo: SQLiteUserCompanyRepository,
        groupRepo: SQLiteUserGroupRepository,
        roleRepo: SQLiteRoleRepository,
      ) => new UserManagementService(userRepo, profileRepo, userCompanyRepo, groupRepo, roleRepo),
      inject: [
        SQLiteUserRepository,
        SQLiteUserProfileRepository,
        SQLiteUserCompanyRepository,
        SQLiteUserGroupRepository,
        SQLiteRoleRepository,
      ],
    },
    {
      provide: UserGroupService,
      useFactory: (groupRepo: SQLiteUserGroupRepository) => new UserGroupService(groupRepo),
      inject: [SQLiteUserGroupRepository],
    },
  ],
})
export class UserModule {}
