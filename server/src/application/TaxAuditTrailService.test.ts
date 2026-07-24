import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '../infrastructure/database/schema.js';
import { SQLiteCompanyRepository } from '../infrastructure/database/CompanyRepository.js';
import { TaxAuditTrailService } from './TaxAuditTrailService.js';
import { TaxType, DeclarationStatus } from '../domain/enums/TaxEnums.js';

describe('TaxAuditTrailService', () => {
  let db: Database.Database;
  let service: TaxAuditTrailService;
  let companyId: number;

  beforeAll(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);
    service = new TaxAuditTrailService(db);

    const companyRepo = new SQLiteCompanyRepository(db);
    companyId = companyRepo.save({ id: 0, name: 'Audit Co', status: 1, createdAt: new Date() }).id;
  });

  afterAll(() => db.close());

  it('logs declaration status change', () => {
    service.logChange({
      declarationId: 1,
      companyId,
      taxType: TaxType.VAT,
      fromStatus: DeclarationStatus.Draft,
      toStatus: DeclarationStatus.Submitted,
      changedByUserId: 1,
    });
    const history = service.getHistory(1);
    expect(history).toHaveLength(1);
    expect(history[0].fromStatus).toBe(DeclarationStatus.Draft);
    expect(history[0].toStatus).toBe(DeclarationStatus.Submitted);
  });

  it('logs multiple status changes', () => {
    service.logChange({ declarationId: 2, companyId, taxType: TaxType.VAT, fromStatus: DeclarationStatus.Draft, toStatus: DeclarationStatus.Computed, changedByUserId: 1 });
    service.logChange({ declarationId: 2, companyId, taxType: TaxType.VAT, fromStatus: DeclarationStatus.Computed, toStatus: DeclarationStatus.Submitted, changedByUserId: 2 });
    const history = service.getHistory(2);
    expect(history).toHaveLength(2);
    expect(history[0].toStatus).toBe(DeclarationStatus.Computed);
    expect(history[1].toStatus).toBe(DeclarationStatus.Submitted);
  });

  it('gets all history for a company', () => {
    const all = service.getCompanyHistory(companyId);
    expect(all.length).toBeGreaterThanOrEqual(3);
  });

  it('returns empty for unknown declaration', () => {
    const history = service.getHistory(9999);
    expect(history).toEqual([]);
  });
});
