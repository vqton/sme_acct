import Database, { type Database as DatabaseType } from 'better-sqlite3';
import type { Company } from '../../domain/entities/Company.js';
import type { CompanyRepository } from '../../domain/repositories/CompanyRepository.js';
import { CompanyStatus } from '../../domain/entities/Company.js';
import { getDb } from '../database/connection.js';

export class SQLiteCompanyRepository implements CompanyRepository {
  private db: DatabaseType;
  private stmts!: ReturnType<typeof SQLiteCompanyRepository['prepareQueries']>;

  constructor(db?: DatabaseType) {
    this.db = db ?? getDb();
    this.stmts = SQLiteCompanyRepository.prepareQueries(this.db);
  }

  private static prepareQueries(db: DatabaseType) {
    const s = (sql: string) => {
      let stmt: ReturnType<typeof db.prepare> | null = null;
      return {
        get: (...params: unknown[]) => {
          stmt ??= db.prepare(sql);
          return (stmt.get as any)(...params) as unknown;
        },
        all: (...params: unknown[]) => {
          stmt ??= db.prepare(sql);
          return (stmt.all as any)(...params) as unknown[];
        },
        run: (...params: unknown[]) => {
          stmt ??= db.prepare(sql);
          return (stmt.run as any)(...params);
        },
      };
    };

    const COLUMNS = `id, name, name_vietnamese, name_english, abbreviated_name, tax_code, enterprise_code, company_type, address, head_office_address, head_office_province_code, head_office_district_code, head_office_ward_code, phone, email, website, logo_url, charter_capital, paid_in_capital, date_of_establishment, date_of_operation_commencement, status, reason_for_dissolution, tax_office_id, tax_office_name, tax_department, managed_by_tax_authority_code, vneid_organization_id, vneid_registration_date, vneid_status, last_vneid_sync_at, legal_representative, created_at, updated_at, created_by_user_id, updated_by_user_id, first_period_start_date, closed_period_count`;

    return {
      findById: s(`SELECT ${COLUMNS} FROM companies WHERE id = ?`),
      findAll: s(`SELECT ${COLUMNS} FROM companies`),
      findByTaxCode: s(`SELECT ${COLUMNS} FROM companies WHERE tax_code = ?`),
      findByEnterpriseCode: s(`SELECT ${COLUMNS} FROM companies WHERE enterprise_code = ?`),
      findByStatus: s(`SELECT ${COLUMNS} FROM companies WHERE status = ?`),
      insert: s(`INSERT INTO companies (${COLUMNS}) VALUES (@id, @name, @nameVietnamese, @nameEnglish, @abbreviatedName, @taxCode, @enterpriseCode, @companyType, @address, @headOfficeAddress, @headOfficeProvinceCode, @headOfficeDistrictCode, @headOfficeWardCode, @phone, @email, @website, @logoUrl, @charterCapital, @paidInCapital, @dateOfEstablishment, @dateOfOperationCommencement, @status, @reasonForDissolution, @taxOfficeId, @taxOfficeName, @taxDepartment, @managedByTaxAuthorityCode, @vNeidOrganizationId, @vNeidRegistrationDate, @vNeidStatus, @lastVNeidSyncAt, @legalRepresentative, @createdAt, @updatedAt, @createdByUserId, @updatedByUserId, @firstPeriodStartDate, @closedPeriodCount)`),
      update: s(`UPDATE companies SET name=@name, name_vietnamese=@nameVietnamese, name_english=@nameEnglish, abbreviated_name=@abbreviatedName, tax_code=@taxCode, enterprise_code=@enterpriseCode, company_type=@companyType, address=@address, head_office_address=@headOfficeAddress, head_office_province_code=@headOfficeProvinceCode, head_office_district_code=@headOfficeDistrictCode, head_office_ward_code=@headOfficeWardCode, phone=@phone, email=@email, website=@website, logo_url=@logoUrl, charter_capital=@charterCapital, paid_in_capital=@paidInCapital, date_of_establishment=@dateOfEstablishment, date_of_operation_commencement=@dateOfOperationCommencement, status=@status, reason_for_dissolution=@reasonForDissolution, tax_office_id=@taxOfficeId, tax_office_name=@taxOfficeName, tax_department=@taxDepartment, managed_by_tax_authority_code=@managedByTaxAuthorityCode, vneid_organization_id=@vNeidOrganizationId, vneid_registration_date=@vNeidRegistrationDate, vneid_status=@vNeidStatus, last_vneid_sync_at=@lastVNeidSyncAt, legal_representative=@legalRepresentative, updated_at=@updatedAt, updated_by_user_id=@updatedByUserId, first_period_start_date=@firstPeriodStartDate, closed_period_count=@closedPeriodCount WHERE id=@id`),
      delete: s('DELETE FROM companies WHERE id = ?'),
    };
  }

  findById(id: number): Company | null {
    const row = this.stmts.findById.get(id) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  findAll(): Company[] {
    return (this.stmts.findAll.all() as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  findByTaxCode(taxCode: string): Company | null {
    const row = this.stmts.findByTaxCode.get(taxCode) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  findByEnterpriseCode(code: string): Company | null {
    const row = this.stmts.findByEnterpriseCode.get(code) as Record<string, unknown> | undefined;
    return row ? this.toEntity(row) : null;
  }

  findByStatus(status: CompanyStatus): Company[] {
    return (this.stmts.findByStatus.all(status) as Record<string, unknown>[]).map((r) => this.toEntity(r));
  }

  save(entity: Company): Company {
    const params = this.toParams(entity);
    if (entity.id) {
      this.stmts.update.run(params);
    } else {
      const result = this.stmts.insert.run(params);
      entity.id = Number(result.lastInsertRowid);
    }
    return entity;
  }

  delete(id: number): void {
    this.stmts.delete.run(id);
  }

  private toEntity(row: Record<string, unknown>): Company {
    return {
      id: row.id as number,
      name: row.name as string,
      nameVietnamese: row.name_vietnamese as string | undefined,
      nameEnglish: row.name_english as string | undefined,
      abbreviatedName: row.abbreviated_name as string | undefined,
      taxCode: row.tax_code as string | undefined,
      enterpriseCode: row.enterprise_code as string | undefined,
      companyType: row.company_type as number | undefined,
      address: row.address as string | undefined,
      headOfficeAddress: row.head_office_address as string | undefined,
      headOfficeProvinceCode: row.head_office_province_code as string | undefined,
      headOfficeDistrictCode: row.head_office_district_code as string | undefined,
      headOfficeWardCode: row.head_office_ward_code as string | undefined,
      phone: row.phone as string | undefined,
      email: row.email as string | undefined,
      website: row.website as string | undefined,
      logoUrl: row.logo_url as string | undefined,
      charterCapital: row.charter_capital as number | undefined,
      paidInCapital: row.paid_in_capital as number | undefined,
      dateOfEstablishment: row.date_of_establishment as string | undefined,
      dateOfOperationCommencement: row.date_of_operation_commencement as string | undefined,
      status: row.status as CompanyStatus,
      reasonForDissolution: row.reason_for_dissolution as string | undefined,
      taxOfficeId: row.tax_office_id as string | undefined,
      taxOfficeName: row.tax_office_name as string | undefined,
      taxDepartment: row.tax_department as string | undefined,
      managedByTaxAuthorityCode: row.managed_by_tax_authority_code as string | undefined,
      vNeIDOrganizationId: row.vneid_organization_id as string | undefined,
      vNeIDRegistrationDate: row.vneid_registration_date as string | undefined,
      vNeIDStatus: row.vneid_status as number | undefined,
      lastVNeIDSyncAt: row.last_vneid_sync_at as string | undefined,
      createdAt: row.created_at as unknown as Date,
      updatedAt: row.updated_at as unknown as Date | undefined,
      createdByUserId: row.created_by_user_id as number | undefined,
      updatedByUserId: row.updated_by_user_id as number | undefined,
      firstPeriodStartDate: row.first_period_start_date as string | undefined,
      closedPeriodCount: row.closed_period_count as number | undefined,
      legalRepresentative: row.legal_representative as string | undefined,
    };
  }

  private toParams(entity: Company) {
    return {
      id: entity.id || null,
      name: entity.name,
      nameVietnamese: entity.nameVietnamese ?? null,
      nameEnglish: entity.nameEnglish ?? null,
      abbreviatedName: entity.abbreviatedName ?? null,
      taxCode: entity.taxCode ?? null,
      enterpriseCode: entity.enterpriseCode ?? null,
      companyType: entity.companyType ?? null,
      address: entity.address ?? null,
      headOfficeAddress: entity.headOfficeAddress ?? null,
      headOfficeProvinceCode: entity.headOfficeProvinceCode ?? null,
      headOfficeDistrictCode: entity.headOfficeDistrictCode ?? null,
      headOfficeWardCode: entity.headOfficeWardCode ?? null,
      phone: entity.phone ?? null,
      email: entity.email ?? null,
      website: entity.website ?? null,
      logoUrl: entity.logoUrl ?? null,
      charterCapital: entity.charterCapital ?? null,
      paidInCapital: entity.paidInCapital ?? null,
      dateOfEstablishment: entity.dateOfEstablishment ?? null,
      dateOfOperationCommencement: entity.dateOfOperationCommencement ?? null,
      status: entity.status,
      reasonForDissolution: entity.reasonForDissolution ?? null,
      taxOfficeId: entity.taxOfficeId ?? null,
      taxOfficeName: entity.taxOfficeName ?? null,
      taxDepartment: entity.taxDepartment ?? null,
      managedByTaxAuthorityCode: entity.managedByTaxAuthorityCode ?? null,
      vNeidOrganizationId: (entity as any).vNeIDOrganizationId ?? null,
      vNeidRegistrationDate: (entity as any).vNeIDRegistrationDate ?? null,
      vNeidStatus: (entity as any).vNeIDStatus ?? null,
      lastVNeidSyncAt: (entity as any).lastVNeIDSyncAt ?? null,
      legalRepresentative: entity.legalRepresentative ?? null,
      createdAt: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
      updatedAt: entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : (entity.updatedAt ?? null),
      updatedByUserId: entity.updatedByUserId ?? null,
      createdByUserId: entity.createdByUserId ?? null,
      firstPeriodStartDate: entity.firstPeriodStartDate ?? null,
      closedPeriodCount: entity.closedPeriodCount ?? null,
    };
  }
}
