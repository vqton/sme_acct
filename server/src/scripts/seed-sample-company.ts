import crypto from 'crypto';
import { getDb } from '../infrastructure/database/connection.js';
import { SQLiteCompanyRepository } from '../infrastructure/database/CompanyRepository.js';
import { SQLiteUserCompanyRepository } from '../infrastructure/database/UserCompanyRepository.js';
import { SQLiteUserRepository } from '../infrastructure/database/UserRepository.js';
import { initDatabase } from '../infrastructure/database/schema.js';

function main() {
  initDatabase();
  const db = getDb();
  const companyRepo = new SQLiteCompanyRepository(db);
  const userCompanyRepo = new SQLiteUserCompanyRepository(db);
  const userRepo = new SQLiteUserRepository(db);

  const admin = userRepo.findByUsername('admin');
  if (!admin) {
    console.error('Admin user not found. Run seed-admin-user first.');
    process.exit(1);
  }

  const company = companyRepo.save({
    id: crypto.randomUUID(),
    name: 'Công ty TNHH ABC',
    nameVietnamese: 'Công ty Trách Nhiệm Hữu Hạn ABC',
    nameEnglish: 'ABC Limited Liability Company',
    abbreviatedName: 'ABC Co., Ltd',
    taxCode: '0123456789',
    enterpriseCode: '0123456789',
    companyType: 1,
    address: '123 Đường Lê Lợi, Phường Bến Nghé',
    headOfficeAddress: '123 Đường Lê Lợi, Phường Bến Nghé, Quận 1',
    headOfficeProvinceCode: '79',
    headOfficeDistrictCode: '760',
    headOfficeWardCode: '76010',
    phone: '02838223344',
    email: 'info@abc.vn',
    website: 'https://abc.vn',
    charterCapital: 10_000_000_000,
    paidInCapital: 10_000_000_000,
    dateOfEstablishment: '2020-01-01',
    dateOfOperationCommencement: '2020-03-01',
    status: 1,
    createdAt: new Date(),
    createdByUserId: admin.id,
  });
  console.log(`✓ Created company "${company.name}" (ID: ${company.id})`);

  userCompanyRepo.create({
    userId: admin.id,
    companyId: company.id,
    role: 'giam-doc',
    isActive: true,
    joinedAt: new Date(),
  });
  console.log(`✓ Assigned admin user to company as giam-doc`);
}

main();
