import { Injectable, OnApplicationBootstrap, Inject } from '@nestjs/common';
import Database from 'better-sqlite3';
import { RoleSeeder } from '../../../infrastructure/database/RoleSeeder.js';
import { SQLiteUserRepository } from '../../../infrastructure/database/UserRepository.js';
import { SQLiteRoleRepository } from '../../../infrastructure/database/RoleRepository.js';
import { DB_PROVIDER } from '../database.module.js';

@Injectable()
export class AppLifecycleHook implements OnApplicationBootstrap {
  constructor(
    @Inject(DB_PROVIDER) private db: Database.Database,
  ) {}

  onApplicationBootstrap() {
    new RoleSeeder(new SQLiteUserRepository(this.db), new SQLiteRoleRepository(this.db)).seed();
  }
}
