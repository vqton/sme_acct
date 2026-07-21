import type { Database } from 'better-sqlite3';

export function migrateCompanyExpansion(db: Database): void {
  // Add new columns to companies (idempotent — uses IF NOT EXISTS pattern)
  const cols = db.prepare("PRAGMA table_info(companies)").all() as { name: string }[];
  const names = cols.map((c) => c.name);

  const addCol = (name: string, def: string) => {
    if (!names.includes(name)) {
      db.exec(`ALTER TABLE companies ADD COLUMN ${name} ${def}`);
    }
  };

  addCol('name_english', 'TEXT');
  addCol('abbreviated_name', 'TEXT');
  addCol('company_type', 'INTEGER');
  addCol('head_office_address', 'TEXT');
  addCol('head_office_province_code', 'TEXT');
  addCol('head_office_district_code', 'TEXT');
  addCol('head_office_ward_code', 'TEXT');
  addCol('logo_url', 'TEXT');
  addCol('charter_capital', 'REAL');
  addCol('paid_in_capital', 'REAL');
  addCol('date_of_establishment', 'TEXT');
  addCol('date_of_operation_commencement', 'TEXT');
  addCol('reason_for_dissolution', 'TEXT');
  addCol('tax_office_id', 'TEXT');
  addCol('tax_office_name', 'TEXT');
  addCol('tax_department', 'TEXT');
  addCol('managed_by_tax_authority_code', 'TEXT');
  addCol('vneid_organization_id', 'TEXT');
  addCol('vneid_registration_date', 'TEXT');
  addCol('vneid_status', 'INTEGER DEFAULT 1');
  addCol('last_vneid_sync_at', 'TEXT');
  addCol('created_by_user_id', 'TEXT');
  addCol('updated_by_user_id', 'TEXT');
  addCol('first_period_start_date', 'TEXT');
  addCol('closed_period_count', 'INTEGER DEFAULT 0');

  // Add new columns to company_settings
  const sCols = db.prepare("PRAGMA table_info(company_settings)").all() as { name: string }[];
  const sNames = sCols.map((c) => c.name);

  const addSCol = (name: string, def: string) => {
    if (!sNames.includes(name)) db.exec(`ALTER TABLE company_settings ADD COLUMN ${name} ${def}`);
  };

  addSCol('inventory_method', 'INTEGER DEFAULT 1');
  addSCol('enable_multi_currency', 'INTEGER NOT NULL DEFAULT 0');
  addSCol('enable_department_management', 'INTEGER NOT NULL DEFAULT 1');
  addSCol('default_exchange_rate_source', 'INTEGER DEFAULT 1');
  addSCol('last_period_closed', 'TEXT');

  // Set decimal_places to 0 for all existing companies (per TT 99/2025)
  db.prepare("UPDATE company_settings SET decimal_places = 0 WHERE decimal_places IS NULL OR decimal_places = 2").run();

  // Seed default settings for companies that don't have them
  const companiesWithoutSettings = db.prepare(
    "SELECT c.id FROM companies c LEFT JOIN company_settings s ON c.id = s.company_id WHERE s.id IS NULL",
  ).all() as { id: string }[];

  const insertSettings = db.prepare(
    "INSERT OR IGNORE INTO company_settings (id, company_id, fiscal_year_start_month, currency_code, decimal_places, accounting_regime, tax_calculation_method, rounding_method) VALUES (?, ?, 1, 'VND', 0, 1, 1, 1)",
  );

  for (const c of companiesWithoutSettings) {
    insertSettings.run(crypto.randomUUID(), c.id);
  }

  console.log(`Migration 001: Updated ${companiesWithoutSettings.length} companies with default settings`);
}
