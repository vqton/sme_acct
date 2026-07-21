import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from './schema.js';
import { SQLiteCapitalContributorRepository } from './CapitalContributorRepository.js';
import { createCapitalContributor, validateOwnershipRatio } from '../../domain/entities/CapitalContributor.js';

describe('SQLiteCapitalContributorRepository', () => {
  let db: Database.Database;
  let repo: SQLiteCapitalContributorRepository;

  beforeEach(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);
    db.prepare(`INSERT INTO companies (id, name, status) VALUES ('c1', 'Test Co', 1)`).run();
    repo = new SQLiteCapitalContributorRepository(db);
  });

  it('saves and finds by id', () => {
    const cc = createCapitalContributor({
      companyId: 'c1', fullName: 'Nguyễn Văn A',
      contributorType: 1, contributorCategory: 1,
      capitalContribution: 50000000, ownershipRatio: 50,
      contributionDate: '2024-01-15', isFounder: true,
    });
    repo.save(cc);
    const found = repo.findById(cc.id);
    expect(found).not.toBeNull();
    expect(found!.fullName).toBe('Nguyễn Văn A');
    expect(found!.capitalContribution).toBe(50000000);
  });

  it('finds by company id sorted by ratio', () => {
    const c1 = createCapitalContributor({
      companyId: 'c1', fullName: 'A', contributorType: 1, contributorCategory: 1,
      capitalContribution: 30000000, ownershipRatio: 30, contributionDate: '2024-01-15', isFounder: false,
    });
    const c2 = createCapitalContributor({
      companyId: 'c1', fullName: 'B', contributorType: 1, contributorCategory: 1,
      capitalContribution: 70000000, ownershipRatio: 70, contributionDate: '2024-01-15', isFounder: false,
    });
    repo.save(c1);
    repo.save(c2);
    const list = repo.findByCompanyId('c1');
    expect(list).toHaveLength(2);
    expect(list[0].ownershipRatio).toBe(70);
  });

  it('validates ownership ratio sums to 100', () => {
    const contributors = [
      createCapitalContributor({ companyId: 'c1', fullName: 'A', contributorType: 1, contributorCategory: 1, capitalContribution: 30, ownershipRatio: 30, contributionDate: '2024-01-15', isFounder: false }),
      createCapitalContributor({ companyId: 'c1', fullName: 'B', contributorType: 1, contributorCategory: 1, capitalContribution: 70, ownershipRatio: 70, contributionDate: '2024-01-15', isFounder: false }),
    ];
    const result = validateOwnershipRatio(contributors);
    expect(result.valid).toBe(true);
    expect(result.total).toBe(100);
  });

  it('catches invalid ownership ratio', () => {
    const contributors = [
      createCapitalContributor({ companyId: 'c1', fullName: 'A', contributorType: 1, contributorCategory: 1, capitalContribution: 30, ownershipRatio: 30, contributionDate: '2024-01-15', isFounder: false }),
    ];
    const result = validateOwnershipRatio(contributors);
    expect(result.valid).toBe(false);
  });
});
