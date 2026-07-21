import { describe, it, expect } from 'vitest';
import { Company, CompanyStatus, createCompany } from '../entities/Company.js';
import { CompanyService, canTransition, getValidTransitions } from './CompanyService.js';

function makeCompany(status: CompanyStatus): Company {
  return createCompany({ name: 'Test', status });
}

describe('CompanyService', () => {
  const service = new CompanyService();

  describe('canTransition', () => {
    it('allows Active → Suspended', () => {
      expect(canTransition(CompanyStatus.Active, CompanyStatus.Suspended)).toBe(true);
    });

    it('allows Active → Dissolved', () => {
      expect(canTransition(CompanyStatus.Active, CompanyStatus.Dissolved)).toBe(true);
    });

    it('allows Active → Bankrupt', () => {
      expect(canTransition(CompanyStatus.Active, CompanyStatus.Bankrupt)).toBe(true);
    });

    it('allows Active → Converting', () => {
      expect(canTransition(CompanyStatus.Active, CompanyStatus.Converting)).toBe(true);
    });

    it('allows Active → Merged', () => {
      expect(canTransition(CompanyStatus.Active, CompanyStatus.Merged)).toBe(true);
    });

    it('allows Suspended → Active', () => {
      expect(canTransition(CompanyStatus.Suspended, CompanyStatus.Active)).toBe(true);
    });

    it('allows Suspended → Dissolved', () => {
      expect(canTransition(CompanyStatus.Suspended, CompanyStatus.Dissolved)).toBe(true);
    });

    it('allows Suspended → Bankrupt', () => {
      expect(canTransition(CompanyStatus.Suspended, CompanyStatus.Bankrupt)).toBe(true);
    });

    it('allows Suspended → Merged', () => {
      expect(canTransition(CompanyStatus.Suspended, CompanyStatus.Merged)).toBe(true);
    });

    it('allows Converting → Active', () => {
      expect(canTransition(CompanyStatus.Converting, CompanyStatus.Active)).toBe(true);
    });

    it('allows Converting → Suspended', () => {
      expect(canTransition(CompanyStatus.Converting, CompanyStatus.Suspended)).toBe(true);
    });

    it('blocks transitions from terminal states (Dissolved)', () => {
      expect(canTransition(CompanyStatus.Dissolved, CompanyStatus.Active)).toBe(false);
      expect(canTransition(CompanyStatus.Dissolved, CompanyStatus.Suspended)).toBe(false);
    });

    it('blocks transitions from terminal states (Bankrupt)', () => {
      expect(canTransition(CompanyStatus.Bankrupt, CompanyStatus.Active)).toBe(false);
    });

    it('blocks transitions from terminal states (Merged)', () => {
      expect(canTransition(CompanyStatus.Merged, CompanyStatus.Active)).toBe(false);
    });

    it('blocks Suspended → Converting', () => {
      expect(canTransition(CompanyStatus.Suspended, CompanyStatus.Converting)).toBe(false);
    });

    it('blocks Active → Active (self)', () => {
      expect(canTransition(CompanyStatus.Active, CompanyStatus.Active)).toBe(false);
    });
  });

  describe('getValidTransitions', () => {
    it('returns 5 valid transitions for Active', () => {
      expect(getValidTransitions(CompanyStatus.Active)).toHaveLength(5);
    });

    it('returns 4 valid transitions for Suspended', () => {
      expect(getValidTransitions(CompanyStatus.Suspended)).toHaveLength(4);
    });

    it('returns 2 valid transitions for Converting', () => {
      expect(getValidTransitions(CompanyStatus.Converting)).toHaveLength(2);
    });

    it('returns empty for Dissolved', () => {
      expect(getValidTransitions(CompanyStatus.Dissolved)).toHaveLength(0);
    });

    it('returns empty for Bankrupt', () => {
      expect(getValidTransitions(CompanyStatus.Bankrupt)).toHaveLength(0);
    });

    it('returns empty for Merged', () => {
      expect(getValidTransitions(CompanyStatus.Merged)).toHaveLength(0);
    });
  });

  describe('activate', () => {
    it('activates a suspended company', () => {
      const c = makeCompany(CompanyStatus.Suspended);
      const result = service.activate(c);
      expect(result.status).toBe(CompanyStatus.Active);
    });

    it('throws for non-suspended company', () => {
      expect(() => service.activate(makeCompany(CompanyStatus.Active))).toThrow('Cannot activate');
    });
  });

  describe('suspend', () => {
    it('suspends an active company', () => {
      const c = makeCompany(CompanyStatus.Active);
      const result = service.suspend(c);
      expect(result.status).toBe(CompanyStatus.Suspended);
    });

    it('throws for non-active company', () => {
      expect(() => service.suspend(makeCompany(CompanyStatus.Suspended))).toThrow('Cannot suspend');
    });
  });

  describe('dissolve', () => {
    it('dissolves an active company', () => {
      const c = makeCompany(CompanyStatus.Active);
      const result = service.dissolve(c, 'Business closed');
      expect(result.status).toBe(CompanyStatus.Dissolved);
      expect(result.reasonForDissolution).toBe('Business closed');
    });

    it('dissolves a suspended company', () => {
      const c = makeCompany(CompanyStatus.Suspended);
      const result = service.dissolve(c);
      expect(result.status).toBe(CompanyStatus.Dissolved);
    });

    it('throws for already dissolved company', () => {
      expect(() => service.dissolve(makeCompany(CompanyStatus.Dissolved))).toThrow('Cannot dissolve');
    });
  });

  describe('bankrupt', () => {
    it('marks active company bankrupt', () => {
      const c = makeCompany(CompanyStatus.Active);
      const result = service.bankrupt(c);
      expect(result.status).toBe(CompanyStatus.Bankrupt);
    });

    it('marks suspended company bankrupt', () => {
      const c = makeCompany(CompanyStatus.Suspended);
      const result = service.bankrupt(c);
      expect(result.status).toBe(CompanyStatus.Bankrupt);
    });

    it('throws for dissolved company', () => {
      expect(() => service.bankrupt(makeCompany(CompanyStatus.Dissolved))).toThrow('Cannot mark');
    });
  });

  describe('convert', () => {
    it('converts active company', () => {
      const c = makeCompany(CompanyStatus.Active);
      const result = service.convert(c);
      expect(result.status).toBe(CompanyStatus.Converting);
    });

    it('throws for suspended company', () => {
      expect(() => service.convert(makeCompany(CompanyStatus.Suspended))).toThrow('Cannot convert');
    });
  });

  describe('merge', () => {
    it('merges active company', () => {
      const c = makeCompany(CompanyStatus.Active);
      const result = service.merge(c);
      expect(result.status).toBe(CompanyStatus.Merged);
    });

    it('merges suspended company', () => {
      const c = makeCompany(CompanyStatus.Suspended);
      const result = service.merge(c);
      expect(result.status).toBe(CompanyStatus.Merged);
    });

    it('merges converting company', () => {
      const c = makeCompany(CompanyStatus.Converting);
      const result = service.merge(c);
      expect(result.status).toBe(CompanyStatus.Merged);
    });

    it('throws for dissolved', () => {
      expect(() => service.merge(makeCompany(CompanyStatus.Dissolved))).toThrow('Cannot merge');
    });

    it('throws for bankrupt', () => {
      expect(() => service.merge(makeCompany(CompanyStatus.Bankrupt))).toThrow('Cannot merge');
    });
  });
});
