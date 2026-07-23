import 'dotenv/config';
import { getDb } from '../infrastructure/database/connection.js';
import { SQLiteDepartmentRepository } from '../infrastructure/database/DepartmentRepository.js';
import { DepartmentSeeder } from '../infrastructure/database/DepartmentSeeder.js';
import { initDatabase } from '../infrastructure/database/schema.js';

function main() {
  initDatabase();
  const db = getDb();

  const companyId = process.argv[2];
  if (!companyId) {
    const rows = db.prepare('SELECT id, name, tax_code FROM companies ORDER BY name').all() as { id: number; name: string; tax_code: string }[];
    if (rows.length === 0) {
      console.error('No companies found. Run seed:company first.');
      process.exit(1);
    }
    console.log('Available companies:');
    for (const r of rows) {
      console.log(`  ${r.id}  ${r.name} (MST: ${r.tax_code})`);
    }
    console.error('\nUsage: tsx src/scripts/seed-departments.ts <companyId>');
    process.exit(1);
  }

  const deptRepo = new SQLiteDepartmentRepository(db);
  const seeder = new DepartmentSeeder(deptRepo);

  const existingCount = db.prepare('SELECT COUNT(*) as c FROM departments WHERE company_id = ?').get(+companyId) as { c: number };
  if (existingCount.c > 0) {
    console.log(`Company already has ${existingCount.c} departments. Skipping seed.`);
    console.log('Delete existing departments first to re-seed.');
    process.exit(0);
  }

  const count = seeder.seed(+companyId);
  console.log(`✓ Seeded ${count} standard departments for SME`);
}

main();
