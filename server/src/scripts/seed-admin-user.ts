import bcrypt from 'bcryptjs';
import { getDb } from '../infrastructure/database/connection.js';
import { SQLiteUserRepository } from '../infrastructure/database/UserRepository.js';
import { SQLiteRoleRepository } from '../infrastructure/database/RoleRepository.js';
import { initDatabase } from '../infrastructure/database/schema.js';

function main() {
  initDatabase();
  const db = getDb();
  const userRepo = new SQLiteUserRepository(db);
  const roleRepo = new SQLiteRoleRepository(db);

  roleRepo.seedPermissions();

  const username = 'admin';
  const password = 'Admin@123456';
  const existing = userRepo.findByUsername(username);

  if (existing) {
    const hash = bcrypt.hashSync(password, 10);
    userRepo.save({ ...existing, passwordHash: hash, isActive: true, failedLoginAttempts: 0, lockoutUntil: null, updatedAt: new Date() });
    roleRepo.assignRole(existing.id, 'he-thong');
    console.log(`✓ Updated admin user "${username}" password + role`);
  } else {
    const hash = bcrypt.hashSync(password, 10);
    const user = userRepo.save({
      id: 0,
      username,
      email: 'admin@smeacct.vn',
      fullName: 'System Administrator',
      passwordHash: hash,
      isActive: true,
      twoFactorEnabled: false,
      failedLoginAttempts: 0,
      lockoutUntil: null,
      createdAt: new Date(),
    });
    roleRepo.assignRole(user.id, 'he-thong');
    console.log(`✓ Created admin user "${username}" with role he-thong`);
  }
}

main();
