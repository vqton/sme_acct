import { describe, it, expect } from 'vitest';
import { VNeIDNumber } from './VNeIDNumber.js';

describe('VNeIDNumber', () => {
  it('creates from 12 digits', () => {
    const vn = VNeIDNumber.create('001234567890');
    expect(vn.toString()).toBe('001234567890');
  });

  it('strips separators', () => {
    const vn = VNeIDNumber.create('001-234.567 890');
    expect(vn.toString()).toBe('001234567890');
  });

  it('rejects less than 12 digits', () => {
    expect(() => VNeIDNumber.create('00123456789')).toThrow('Invalid VNeID number');
  });

  it('rejects more than 12 digits', () => {
    expect(() => VNeIDNumber.create('0012345678901')).toThrow('Invalid VNeID number');
  });

  it('rejects non-digit characters', () => {
    expect(() => VNeIDNumber.create('00123456789a')).toThrow('Invalid VNeID number');
  });

  it('rejects empty string', () => {
    expect(() => VNeIDNumber.create('')).toThrow('Invalid VNeID number');
  });

  it('equals returns true for same value', () => {
    const a = VNeIDNumber.create('001234567890');
    const b = VNeIDNumber.create('001234567890');
    expect(a.equals(b)).toBe(true);
  });

  it('equals returns false for different value', () => {
    const a = VNeIDNumber.create('001234567890');
    const b = VNeIDNumber.create('009876543210');
    expect(a.equals(b)).toBe(false);
  });

  it('getBirthCentury returns 2000 for first digit 0', () => {
    expect(VNeIDNumber.create('001234567890').getBirthCentury()).toBe(2000);
  });

  it('getBirthCentury returns 1900 for first digit 1', () => {
    expect(VNeIDNumber.create('101234567890').getBirthCentury()).toBe(1900);
  });
});
