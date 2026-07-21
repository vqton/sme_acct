import { describe, it, expect } from 'vitest';
import { createTestDb, createTestRepos } from './helpers/db.js';

describe('test infrastructure', () => {
  it('creates in-memory database with migrations', () => {
    const db = createTestDb();
    const result = db.prepare('SELECT name FROM sqlite_master WHERE type=\'table\' ORDER BY name').all();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result!.length).toBeGreaterThanOrEqual(4);
    db.close();
  });

  it('creates working repositories', () => {
    const db = createTestDb();
    const { userRepo, companyRepo } = createTestRepos(db);
    expect(userRepo.findAll()).toEqual([]);
    expect(companyRepo.findAll()).toEqual([]);
    db.close();
  });
});
