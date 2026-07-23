import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from './schema.js';
import { SQLLegalRepresentativeRepository } from './LegalRepresentativeRepository.js';
import { createLegalRepresentative } from '../../domain/entities/LegalRepresentative.js';

describe('SQLLegalRepresentativeRepository', () => {
  let db: Database.Database;
  let repo: SQLLegalRepresentativeRepository;

  beforeEach(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);

    db.prepare(`INSERT INTO companies (id, name, status) VALUES (1, 'Test Co', 1)`).run();

    repo = new SQLLegalRepresentativeRepository(db);
  });

  it('saves and finds by id', () => {
    const lr = createLegalRepresentative({
      companyId: 1, fullName: 'Nguyễn Văn A', position: 'Director', isPrimary: true,
    });
    repo.save(lr);
    const found = repo.findById(lr.id);
    expect(found).not.toBeNull();
    expect(found!.fullName).toBe('Nguyễn Văn A');
    expect(found!.isPrimary).toBe(true);
  });

  it('finds by company id', () => {
    const lr1 = createLegalRepresentative({
      companyId: 1, fullName: 'A', position: 'Director', isPrimary: true,
    });
    const lr2 = createLegalRepresentative({
      companyId: 1, fullName: 'B', position: 'Manager', isPrimary: false,
    });
    repo.save(lr1);
    repo.save(lr2);

    const list = repo.findByCompanyId(1);
    expect(list).toHaveLength(2);
  });

  it('returns empty list for unknown company', () => {
    expect(repo.findByCompanyId(999)).toHaveLength(0);
  });

  it('finds primary legal rep', () => {
    const lr1 = createLegalRepresentative({
      companyId: 1, fullName: 'A', position: 'Director', isPrimary: true,
    });
    const lr2 = createLegalRepresentative({
      companyId: 1, fullName: 'B', position: 'Manager', isPrimary: false,
    });
    repo.save(lr1);
    repo.save(lr2);

    const primary = repo.findPrimaryByCompanyId(1);
    expect(primary).not.toBeNull();
    expect(primary!.fullName).toBe('A');
  });

  it('returns null for primary when none set', () => {
    const lr = createLegalRepresentative({
      companyId: 1, fullName: 'A', position: 'Director', isPrimary: false,
    });
    repo.save(lr);
    expect(repo.findPrimaryByCompanyId(1)).toBeNull();
  });

  it('updates existing record', () => {
    const lr = createLegalRepresentative({
      companyId: 1, fullName: 'Original', position: 'Director', isPrimary: true,
    });
    repo.save(lr);

    lr.fullName = 'Updated';
    lr.isPrimary = false;
    repo.save(lr);

    const found = repo.findById(lr.id);
    expect(found!.fullName).toBe('Updated');
    expect(found!.isPrimary).toBe(false);
  });

  it('deletes by id', () => {
    const lr = createLegalRepresentative({
      companyId: 1, fullName: 'A', position: 'Director', isPrimary: true,
    });
    repo.save(lr);
    repo.delete(lr.id);
    expect(repo.findById(lr.id)).toBeNull();
  });

  it('filters inactive reps from primary query', () => {
    const lr = createLegalRepresentative({
      companyId: 1, fullName: 'A', position: 'Director', isPrimary: true, isActive: false,
    });
    repo.save(lr);
    expect(repo.findPrimaryByCompanyId(1)).toBeNull();
  });
});
