import { describe, it, expect } from 'vitest';
import { EnterpriseCode } from './EnterpriseCode.js';

describe('EnterpriseCode', () => {
  it('creates from 10 digits', () => {
    const ec = EnterpriseCode.create('0312345678');
    expect(ec.toString()).toBe('0312345678');
  });

  it('strips separators', () => {
    const ec = EnterpriseCode.create('031-234.5678');
    expect(ec.toString()).toBe('0312345678');
  });

  it('rejects less than 10 digits', () => {
    expect(() => EnterpriseCode.create('031234567')).toThrow('Invalid enterprise code');
  });

  it('rejects more than 10 digits', () => {
    expect(() => EnterpriseCode.create('03123456789')).toThrow('Invalid enterprise code');
  });

  it('rejects non-digit characters', () => {
    expect(() => EnterpriseCode.create('031234567a')).toThrow('Invalid enterprise code');
  });

  it('rejects empty string', () => {
    expect(() => EnterpriseCode.create('')).toThrow('Invalid enterprise code');
  });

  it('equals returns true for same value', () => {
    const a = EnterpriseCode.create('0312345678');
    const b = EnterpriseCode.create('0312345678');
    expect(a.equals(b)).toBe(true);
  });

  it('equals returns false for different value', () => {
    const a = EnterpriseCode.create('0312345678');
    const b = EnterpriseCode.create('0398765432');
    expect(a.equals(b)).toBe(false);
  });

  it('getRegistrationYear extracts century from first 2 digits', () => {
    const ec = EnterpriseCode.create('2501234567');
    expect(ec.getRegistrationYear()).toBe(2025);
  });

  it('getProvinceCode extracts digits 3-4', () => {
    const ec = EnterpriseCode.create('2501234567');
    expect(ec.getProvinceCode()).toBe('01');
  });

  it('getSerialNumber extracts digits 5-10', () => {
    const ec = EnterpriseCode.create('2501234567');
    expect(ec.getSerialNumber()).toBe('234567');
  });
});
