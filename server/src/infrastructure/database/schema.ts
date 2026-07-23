import type { Database } from 'better-sqlite3';
import { getDb } from './connection.js';

export function runMigrations(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_vietnamese TEXT,
      name_english TEXT,
      abbreviated_name TEXT,
      tax_code TEXT,
      enterprise_code TEXT,
      company_type INTEGER,
      address TEXT,
      head_office_address TEXT,
      head_office_province_code TEXT,
      head_office_district_code TEXT,
      head_office_ward_code TEXT,
      phone TEXT,
      email TEXT,
      website TEXT,
      logo_url TEXT,
      charter_capital REAL,
      paid_in_capital REAL,
      date_of_establishment TEXT,
      date_of_operation_commencement TEXT,
      status INTEGER NOT NULL DEFAULT 1,
      reason_for_dissolution TEXT,
      tax_office_id TEXT,
      tax_office_name TEXT,
      tax_department TEXT,
      managed_by_tax_authority_code TEXT,
      vneid_organization_id TEXT,
      vneid_registration_date TEXT,
      vneid_status INTEGER DEFAULT 1,
      last_vneid_sync_at TEXT,
      legal_representative TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT,
      created_by_user_id INTEGER,
      updated_by_user_id INTEGER,
      first_period_start_date TEXT,
      closed_period_count INTEGER DEFAULT 0,
      created_by_company_type INTEGER
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS user_companies (
      user_id INTEGER NOT NULL,
      company_id INTEGER NOT NULL,
      role TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      joined_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, company_id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS company_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL UNIQUE,
      fiscal_year_start_month INTEGER NOT NULL DEFAULT 1,
      currency_code TEXT NOT NULL DEFAULT 'VND',
      decimal_places INTEGER NOT NULL DEFAULT 0,
      accounting_regime INTEGER NOT NULL DEFAULT 1,
      tax_calculation_method INTEGER NOT NULL DEFAULT 1,
      rounding_method INTEGER NOT NULL DEFAULT 1,
      inventory_method INTEGER DEFAULT 1,
      enable_multi_currency INTEGER NOT NULL DEFAULT 0,
      enable_department_management INTEGER NOT NULL DEFAULT 1,
      default_exchange_rate_source INTEGER DEFAULT 1,
      last_period_closed TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      company_id INTEGER,
      token_hash TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      device_name TEXT,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_used_at TEXT,
      revoked_at TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      resource TEXT,
      resource_id TEXT,
      detail TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS user_roles (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      PRIMARY KEY (user_id, role)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS role_permissions (
      role TEXT NOT NULL,
      permission TEXT NOT NULL,
      PRIMARY KEY (role, permission)
    )
  `);

  // Migration: add account lockout columns to users
  const userCols = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
  const colNames = userCols.map((c) => c.name);
  if (!colNames.includes('failed_login_attempts')) {
    db.exec("ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER NOT NULL DEFAULT 0");
  }
  if (!colNames.includes('lockout_until')) {
    db.exec("ALTER TABLE users ADD COLUMN lockout_until TEXT");
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS password_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Migration: add userAgent to audit_logs
  const auditCols = db.prepare("PRAGMA table_info(audit_logs)").all() as { name: string }[];
  const auditColNames = auditCols.map((c) => c.name);
  if (!auditColNames.includes('user_agent')) {
    db.exec("ALTER TABLE audit_logs ADD COLUMN user_agent TEXT");
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      used_at TEXT
    )
  `);

  // Migration: add 2FA columns to users
  if (!colNames.includes('two_factor_enabled')) {
    db.exec("ALTER TABLE users ADD COLUMN two_factor_enabled INTEGER NOT NULL DEFAULT 0");
  }
  if (!colNames.includes('totp_secret')) {
    db.exec("ALTER TABLE users ADD COLUMN totp_secret TEXT");
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS backup_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      code_hash TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // New company module tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS legal_representatives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      full_name TEXT NOT NULL,
      vneid_number TEXT,
      position TEXT NOT NULL,
      is_primary INTEGER NOT NULL DEFAULT 0,
      authorization_scope TEXT,
      digital_cert_serial TEXT,
      digital_cert_provider TEXT,
      digital_cert_expiry TEXT,
      vneid_verified_at TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS business_lines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      vsic_code TEXT NOT NULL,
      vsic_level INTEGER DEFAULT 4,
      name TEXT NOT NULL,
      is_primary INTEGER NOT NULL DEFAULT 0,
      start_date TEXT NOT NULL DEFAULT (datetime('now')),
      end_date TEXT,
      license_reference TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS capital_contributors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      contributor_type INTEGER NOT NULL DEFAULT 1,
      full_name TEXT NOT NULL,
      id_number TEXT,
      contributor_category INTEGER NOT NULL DEFAULT 1,
      capital_contribution REAL NOT NULL DEFAULT 0,
      ownership_ratio REAL NOT NULL DEFAULT 0,
      contribution_date TEXT NOT NULL DEFAULT (datetime('now')),
      contribution_certificate TEXT,
      is_founder INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS company_bank_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      account_number TEXT NOT NULL,
      account_name TEXT NOT NULL,
      bank_name TEXT NOT NULL,
      bank_branch TEXT,
      swift_code TEXT,
      currency_code TEXT NOT NULL DEFAULT 'VND',
      is_primary_tax_payment INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      opened_date TEXT NOT NULL DEFAULT (datetime('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS company_branches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      branch_type INTEGER NOT NULL DEFAULT 1,
      name TEXT NOT NULL,
      address TEXT,
      tax_code TEXT,
      phone TEXT,
      manager_name TEXT,
      status INTEGER NOT NULL DEFAULT 1,
      date_opened TEXT NOT NULL DEFAULT (datetime('now')),
      date_closed TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS company_former_names (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      changed_at TEXT NOT NULL DEFAULT (datetime('now')),
      changed_by_user_id INTEGER,
      reason TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS company_licenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      license_type INTEGER NOT NULL,
      license_number TEXT NOT NULL,
      issued_by TEXT NOT NULL,
      date_issued TEXT NOT NULL,
      date_expiry TEXT,
      file_url TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS company_seals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
      seal_registration_number TEXT,
      seal_image_url TEXT,
      issued_by TEXT,
      date_registered TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS company_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      document_type INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_size INTEGER,
      content_type TEXT,
      expiry_date TEXT,
      uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_firm_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      audit_firm_name TEXT NOT NULL,
      audit_firm_tax_code TEXT,
      audit_firm_address TEXT,
      assignment_year INTEGER NOT NULL,
      engagement_partner TEXT,
      audit_start_date TEXT,
      audit_end_date TEXT,
      audit_report_reference TEXT,
      status INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS vsic_reference (
      code TEXT PRIMARY KEY,
      level INTEGER NOT NULL,
      name TEXT NOT NULL,
      parent_code TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS capital_change_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      previous_charter_capital REAL,
      new_charter_capital REAL NOT NULL,
      change_reason TEXT,
      changed_at TEXT NOT NULL DEFAULT (datetime('now')),
      changed_by_user_id INTEGER
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS company_correction_reasons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      field_name TEXT NOT NULL,
      previous_value TEXT,
      new_value TEXT NOT NULL,
      reason_code TEXT NOT NULL,
      reason_detail TEXT,
      correction_date TEXT NOT NULL DEFAULT (datetime('now')),
      corrected_by_user_id INTEGER
    )
  `);

  // Migration: add new columns to companies table repeatedly
  // Use ALTER TABLE ADD COLUMN for columns that may not exist yet
  const companyCols = db.prepare("PRAGMA table_info(companies)").all() as { name: string }[];
  const companyColNames = companyCols.map((c) => c.name);

  const companyMigrations: [string, string][] = [
    ['name_english', "ALTER TABLE companies ADD COLUMN name_english TEXT"],
    ['abbreviated_name', "ALTER TABLE companies ADD COLUMN abbreviated_name TEXT"],
    ['company_type', "ALTER TABLE companies ADD COLUMN company_type INTEGER"],
    ['head_office_address', "ALTER TABLE companies ADD COLUMN head_office_address TEXT"],
    ['head_office_province_code', "ALTER TABLE companies ADD COLUMN head_office_province_code TEXT"],
    ['head_office_district_code', "ALTER TABLE companies ADD COLUMN head_office_district_code TEXT"],
    ['head_office_ward_code', "ALTER TABLE companies ADD COLUMN head_office_ward_code TEXT"],
    ['logo_url', "ALTER TABLE companies ADD COLUMN logo_url TEXT"],
    ['charter_capital', "ALTER TABLE companies ADD COLUMN charter_capital REAL"],
    ['paid_in_capital', "ALTER TABLE companies ADD COLUMN paid_in_capital REAL"],
    ['date_of_establishment', "ALTER TABLE companies ADD COLUMN date_of_establishment TEXT"],
    ['date_of_operation_commencement', "ALTER TABLE companies ADD COLUMN date_of_operation_commencement TEXT"],
    ['reason_for_dissolution', "ALTER TABLE companies ADD COLUMN reason_for_dissolution TEXT"],
    ['tax_office_id', "ALTER TABLE companies ADD COLUMN tax_office_id TEXT"],
    ['tax_office_name', "ALTER TABLE companies ADD COLUMN tax_office_name TEXT"],
    ['tax_department', "ALTER TABLE companies ADD COLUMN tax_department TEXT"],
    ['managed_by_tax_authority_code', "ALTER TABLE companies ADD COLUMN managed_by_tax_authority_code TEXT"],
    ['vneid_organization_id', "ALTER TABLE companies ADD COLUMN vneid_organization_id TEXT"],
    ['vneid_registration_date', "ALTER TABLE companies ADD COLUMN vneid_registration_date TEXT"],
    ['vneid_status', "ALTER TABLE companies ADD COLUMN vneid_status INTEGER DEFAULT 1"],
    ['last_vneid_sync_at', "ALTER TABLE companies ADD COLUMN last_vneid_sync_at TEXT"],
    ['created_by_user_id', "ALTER TABLE companies ADD COLUMN created_by_user_id INTEGER"],
    ['updated_by_user_id', "ALTER TABLE companies ADD COLUMN updated_by_user_id INTEGER"],
    ['first_period_start_date', "ALTER TABLE companies ADD COLUMN first_period_start_date TEXT"],
    ['closed_period_count', "ALTER TABLE companies ADD COLUMN closed_period_count INTEGER DEFAULT 0"],
    ['created_by_company_type', "ALTER TABLE companies ADD COLUMN created_by_company_type INTEGER"],
  ];

  for (const [col, sql] of companyMigrations) {
    if (!companyColNames.includes(col)) {
      db.exec(sql);
    }
  }

  // ─── Accounting Module Tables ──────────────────────────

  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      account_number TEXT NOT NULL,
      name TEXT NOT NULL,
      name_english TEXT,
      category INTEGER NOT NULL,
      nature INTEGER NOT NULL,
      type INTEGER NOT NULL DEFAULT 1,
      parent_id INTEGER,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_system INTEGER NOT NULL DEFAULT 0,
      allow_transactions INTEGER NOT NULL DEFAULT 1,
      opening_debit REAL NOT NULL DEFAULT 0,
      opening_credit REAL NOT NULL DEFAULT 0,
      debit_amount REAL NOT NULL DEFAULT 0,
      credit_amount REAL NOT NULL DEFAULT 0,
      closing_debit REAL NOT NULL DEFAULT 0,
      closing_credit REAL NOT NULL DEFAULT 0,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT,
      UNIQUE(company_id, account_number)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS fiscal_periods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      period_name TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status INTEGER NOT NULL DEFAULT 1,
      is_opening_balance_period INTEGER NOT NULL DEFAULT 0,
      closed_at TEXT,
      closed_by_user_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT,
      UNIQUE(company_id, year, month)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      entry_number TEXT NOT NULL,
      entry_date TEXT NOT NULL,
      period_id INTEGER NOT NULL REFERENCES fiscal_periods(id),
      entry_type INTEGER NOT NULL DEFAULT 9,
      description TEXT NOT NULL,
      description_english TEXT,
      reference_number TEXT,
      reference_date TEXT,
      total_debit REAL NOT NULL DEFAULT 0,
      total_credit REAL NOT NULL DEFAULT 0,
      is_posted INTEGER NOT NULL DEFAULT 0,
      is_reversed INTEGER NOT NULL DEFAULT 0,
      reversed_by_id INTEGER,
      posted_at TEXT,
      posted_by_user_id INTEGER,
      created_by_user_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS journal_entry_lines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      journal_entry_id INTEGER NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
      account_id INTEGER NOT NULL REFERENCES accounts(id),
      account_number TEXT NOT NULL,
      description TEXT,
      debit_amount REAL NOT NULL DEFAULT 0,
      credit_amount REAL NOT NULL DEFAULT 0,
      cost_center_id TEXT,
      department_id INTEGER,
      project_id TEXT,
      line_index INTEGER NOT NULL DEFAULT 0
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS ledger_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      account_id INTEGER NOT NULL REFERENCES accounts(id),
      account_number TEXT NOT NULL,
      period_id INTEGER NOT NULL REFERENCES fiscal_periods(id),
      journal_entry_id INTEGER NOT NULL REFERENCES journal_entries(id),
      entry_number TEXT NOT NULL,
      entry_date TEXT NOT NULL,
      description TEXT NOT NULL,
      debit_amount REAL NOT NULL DEFAULT 0,
      credit_amount REAL NOT NULL DEFAULT 0,
      running_debit REAL NOT NULL DEFAULT 0,
      running_credit REAL NOT NULL DEFAULT 0,
      running_balance REAL NOT NULL DEFAULT 0,
      cost_center_id TEXT,
      department_id INTEGER,
      project_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS account_balances (
      account_id INTEGER NOT NULL REFERENCES accounts(id),
      account_number TEXT NOT NULL,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      period_id INTEGER NOT NULL REFERENCES fiscal_periods(id),
      opening_debit REAL NOT NULL DEFAULT 0,
      opening_credit REAL NOT NULL DEFAULT 0,
      period_debit REAL NOT NULL DEFAULT 0,
      period_credit REAL NOT NULL DEFAULT 0,
      closing_debit REAL NOT NULL DEFAULT 0,
      closing_credit REAL NOT NULL DEFAULT 0,
      PRIMARY KEY (account_id, period_id)
    )
  `);

  // Migration: add new columns to company_settings
  const settingsCols = db.prepare("PRAGMA table_info(company_settings)").all() as { name: string }[];
  const settingsColNames = settingsCols.map((c) => c.name);
  const settingsMigrations: [string, string][] = [
    ['inventory_method', "ALTER TABLE company_settings ADD COLUMN inventory_method INTEGER DEFAULT 1"],
    ['enable_multi_currency', "ALTER TABLE company_settings ADD COLUMN enable_multi_currency INTEGER NOT NULL DEFAULT 0"],
    ['enable_department_management', "ALTER TABLE company_settings ADD COLUMN enable_department_management INTEGER NOT NULL DEFAULT 1"],
    ['default_exchange_rate_source', "ALTER TABLE company_settings ADD COLUMN default_exchange_rate_source INTEGER DEFAULT 1"],
    ['last_period_closed', "ALTER TABLE company_settings ADD COLUMN last_period_closed TEXT"],
  ];

  for (const [col, sql] of settingsMigrations) {
    if (!settingsColNames.includes(col)) {
      db.exec(sql);
    }
  }

  // ─── User Management Module Tables ─────────────────────

  db.exec(`
    CREATE TABLE IF NOT EXISTS user_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS user_group_members (
      group_id INTEGER NOT NULL REFERENCES user_groups(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      joined_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (group_id, user_id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      phone TEXT,
      position TEXT,
      department TEXT,
      avatar_url TEXT,
      notes TEXT,
      updated_at TEXT
    )
  `);

  // ─── Department Module Tables ──────────────────────────

  db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      name_english TEXT,
      department_type INTEGER NOT NULL DEFAULT 1,
      parent_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
      path TEXT NOT NULL,
      depth INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      manager_user_id INTEGER,
      manager_title TEXT,
      deputy_manager_user_id INTEGER,
      default_salary_account TEXT,
      default_expense_account TEXT,
      cost_allocation_method INTEGER,
      has_budget_control INTEGER NOT NULL DEFAULT 0,
      budget_alert_threshold INTEGER NOT NULL DEFAULT 80,
      budget_control_level INTEGER NOT NULL DEFAULT 1,
      status INTEGER NOT NULL DEFAULT 1,
      effective_date TEXT NOT NULL,
      dissolution_date TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT,
      created_by_user_id INTEGER,
      updated_by_user_id INTEGER,
      UNIQUE(company_id, code)
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_departments_company_id ON departments(company_id)
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_departments_parent_id ON departments(parent_id)
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_departments_path ON departments(path)
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS user_departments (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
      is_primary INTEGER NOT NULL DEFAULT 0,
      job_title TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      assigned_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, department_id)
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_user_departments_user_id ON user_departments(user_id)
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_user_departments_dept_id ON user_departments(department_id)
  `);
}

export function initDatabase(): void {
  runMigrations(getDb());
}
