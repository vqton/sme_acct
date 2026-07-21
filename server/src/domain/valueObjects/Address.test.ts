import { describe, it, expect } from 'vitest';
import { Address } from './Address.js';

describe('Address', () => {
  it('creates from street and province', () => {
    const a = Address.create({ street: '123 Đường Lê Lợi', province: 'TP Hồ Chí Minh' });
    expect(a.street).toBe('123 Đường Lê Lợi');
    expect(a.province).toBe('TP Hồ Chí Minh');
  });

  it('rejects empty street', () => {
    expect(() => Address.create({ street: '', province: 'HN' })).toThrow('required');
  });

  it('rejects empty province', () => {
    expect(() => Address.create({ street: '123 Street', province: '' })).toThrow('required');
  });

  it('formats full address including ward and district', () => {
    const a = Address.create({
      street: '123 Lê Lợi',
      ward: 'Phường Bến Nghé',
      district: 'Quận 1',
      province: 'TP Hồ Chí Minh',
    });
    expect(a.toString()).toBe('123 Lê Lợi, Phường Bến Nghé, Quận 1, TP Hồ Chí Minh');
  });

  it('formats short address without ward/district', () => {
    const a = Address.create({ street: '456 Đường ABC', province: 'Hà Nội' });
    expect(a.toString()).toBe('456 Đường ABC, Hà Nội');
  });

  it('equals returns true for same address', () => {
    const a = Address.create({ street: '123 Street', province: 'HN' });
    const b = Address.create({ street: '123 Street', province: 'HN' });
    expect(a.equals(b)).toBe(true);
  });

  it('equals returns false for different address', () => {
    const a = Address.create({ street: '123 Street', province: 'HN' });
    const b = Address.create({ street: '456 Street', province: 'HN' });
    expect(a.equals(b)).toBe(false);
  });

  it('toParts returns all components', () => {
    const a = Address.create({
      street: '123 Đường',
      ward: 'Phường X',
      district: 'Quận Y',
      province: 'Tỉnh Z',
      wardCode: '001',
      districtCode: '002',
      provinceCode: '003',
    });
    const parts = a.toParts();
    expect(parts.provinceCode).toBe('003');
    expect(parts.districtCode).toBe('002');
    expect(parts.wardCode).toBe('001');
  });

  it('accessors return correct values', () => {
    const a = Address.create({
      street: 'S1', ward: 'W1', district: 'D1', province: 'P1',
      wardCode: 'WC', districtCode: 'DC', provinceCode: 'PC',
    });
    expect(a.street).toBe('S1');
    expect(a.ward).toBe('W1');
    expect(a.district).toBe('D1');
    expect(a.province).toBe('P1');
    expect(a.wardCode).toBe('WC');
    expect(a.districtCode).toBe('DC');
    expect(a.provinceCode).toBe('PC');
  });
});
