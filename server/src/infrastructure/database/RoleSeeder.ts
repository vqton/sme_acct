import bcrypt from 'bcryptjs';
import type { UserRepository } from '../../domain/repositories/UserRepository.js';
import type { RoleRepository } from '../../domain/repositories/RoleRepository.js';
import { ROLES } from '../../domain/entities/Role.js';

export class RoleSeeder {
  constructor(
    private userRepo: UserRepository,
    private roleRepo: RoleRepository,
  ) {}

  seed(): void {
    this.seedRolePermissions();
    this.seedSuperAdmin();
  }

  private seedRolePermissions(): void {
    this.roleRepo.seedPermissions();
  }

  private seedSuperAdmin(): void {
    const username = process.env.SUPER_ADMIN_USERNAME ?? 'admin';
    const existing = this.userRepo.findByUsername(username);
    if (existing) return;

    const email = process.env.SUPER_ADMIN_EMAIL ?? 'admin@smeacct.vn';
    const password = process.env.SUPER_ADMIN_PASSWORD;
    if (!password) {
      console.warn('SUPER_ADMIN_PASSWORD not set — skipping super admin creation');
      return;
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const user = this.userRepo.save({
      id: 0,
      username,
      email,
      fullName: 'System Administrator',
      passwordHash,
      isActive: true,
      twoFactorEnabled: false,
      failedLoginAttempts: 0,
      lockoutUntil: null,
      createdAt: new Date(),
    });

    this.roleRepo.assignRole(user.id, 'he-thong');
    console.log(`Created super admin user "${username}" with role he-thong`);
  }
}
