import { describe, it, expect, vi } from 'vitest';
import { Response, NextFunction } from 'express';
import { requireCompanyAccess, filterByCompany, TenantRequest } from './tenantIsolation.js';

function makeReq(overrides: Partial<TenantRequest> = {}): TenantRequest {
  return {
    headers: {},
    params: {},
    user: { userId: 'u1', username: 'test', roles: [] },
    userCompanyIds: undefined,
    ...overrides,
  } as unknown as TenantRequest;
}

function makeRes() {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('requireCompanyAccess', () => {
  it('allows access when user has company', () => {
    const req = makeReq({ params: { id: 'c1' }, userCompanyIds: ['c1'] });
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    requireCompanyAccess(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('blocks access when user lacks company', () => {
    const req = makeReq({ params: { id: 'c3' }, userCompanyIds: ['c1', 'c2'] });
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    requireCompanyAccess(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 401 when user not authenticated', () => {
    const req = makeReq({ user: undefined });
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    requireCompanyAccess(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 when no company id provided', () => {
    const req = makeReq({ params: {}, userCompanyIds: ['c1'] });
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    requireCompanyAccess(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('filterByCompany', () => {
  it('filters items by companyId', () => {
    const items = [
      { id: '1', companyId: 'c1' },
      { id: '2', companyId: 'c1' },
      { id: '3', companyId: 'c2' },
    ];
    expect(filterByCompany(items, 'c1')).toHaveLength(2);
    expect(filterByCompany(items, 'c2')).toHaveLength(1);
  });

  it('returns all items when no companyId', () => {
    const items = [{ id: '1', companyId: 'c1' }];
    expect(filterByCompany(items, undefined)).toHaveLength(1);
  });
});
