import { Module } from '@nestjs/common';
import { DB_PROVIDER, DatabaseModule } from '../common/database.module.js';
import { DepartmentController } from './department.controller.js';
import { DepartmentUseCases } from '../../application/DepartmentUseCases.js';
import { SQLiteDepartmentRepository } from '../../infrastructure/database/DepartmentRepository.js';
import { SQLiteUserDepartmentRepository } from '../../infrastructure/database/UserDepartmentRepository.js';
import Database from 'better-sqlite3';

@Module({
  imports: [DatabaseModule],
  controllers: [DepartmentController],
  providers: [
    {
      provide: SQLiteDepartmentRepository,
      useFactory: (db: Database.Database) => new SQLiteDepartmentRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: SQLiteUserDepartmentRepository,
      useFactory: (db: Database.Database) => new SQLiteUserDepartmentRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: DepartmentUseCases,
      useFactory: (
        deptRepo: SQLiteDepartmentRepository,
        userDeptRepo: SQLiteUserDepartmentRepository,
      ) => new DepartmentUseCases(deptRepo, userDeptRepo),
      inject: [SQLiteDepartmentRepository, SQLiteUserDepartmentRepository],
    },
  ],
})
export class DepartmentModule {}
