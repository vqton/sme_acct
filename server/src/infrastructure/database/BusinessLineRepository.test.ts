import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from './schema.js';
import { SQLiteBusinessLineRepository } from './BusinessLineRepository.js';
import { createBusinessLine } from '../../domain/entities/BusinessLine.js';

describe('SQLiteBusinessLineRepository', () => {
  let db: Database.Database;
  let repo: SQLiteBusinessLineRepository;

  beforeEach(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);
    db.prepare(`INSERT INTO companies (id, name, status) VALUES (1, 'Test Co', 1)`).run();
    repo = new SQLiteBusinessLineRepository(db);
  });

  it('saves and finds by id', () => {
    const bl = createBusinessLine({
      companyId: 1, vsicCode: '47110', vsicLevel: 4,
      name: 'Bán lẻ trong cửa hàng', isPrimary: true, startDate: '2024-01-15',
    });
    repo.save(bl);
    const found = repo.findById(bl.id);
    expect(found).not.toBeNull();
    expect(found!.vsicCode).toBe('47110');
    expect(found!.isPrimary).toBe(true);
  });

  it('finds primary business line', () => {
    const bl1 = createBusinessLine({
      companyId: 1, vsicCode: '47110', vsicLevel: 4,
      name: 'Primary', isPrimary: true, startDate: '2024-01-15',
    });
    const bl2 = createBusinessLine({
      companyId: 1, vsicCode: '47210', vsicLevel: 4,
      name: 'Secondary', isPrimary: false, startDate: '2024-01-15',
    });
    repo.save(bl1);
    repo.save(bl2);

    const primary = repo.findPrimaryByCompanyId(1);
    expect(primary).not.toBeNull();
    expect(primary!.vsicCode).toBe('47110');
  });
});
