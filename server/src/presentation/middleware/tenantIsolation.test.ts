import { describe, it, expect, vi } from 'vitest';
import { Response, NextFunction } from 'express';
import { requireCompanyAccess, filterByCompany, TenantRequest } from './tenantIsolation.js';

function makeReq(overrides: Partial<TenantRequest> = {}): TenantRequest {
  return {
    headers: {},
    params: {},
    user: { userId: 1, username: 'test', roles: [] },
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
    const req = makeReq({ params: { id: '1' }, userCompanyIds: [1] });
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    requireCompanyAccess(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('blocks access when user lacks company', () => {
    const req = makeReq({ params: { id: '3' }, userCompanyIds: [1, 2] });
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
    const req = makeReq({ params: {}, userCompanyIds: [1] });
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    requireCompanyAccess(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('filterByCompany', () => {
  it('filters items by companyId', () => {
    const items = [
      { id: 1, companyId: 1 },
      { id: 2, companyId: 1 },
      { id: 3, companyId: 2 },
    ];
    expect(filterByCompany(items, 1)).toHaveLength(2);
    expect(filterByCompany(items, 2)).toHaveLength(1);
  });

  it('returns all items when no companyId', () => {
    const items = [{ id: 1, companyId: 1 }];
    expect(filterByCompany(items, undefined)).toHaveLength(1);
  });
});
