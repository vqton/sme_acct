import { describe, it, expect, beforeEach } from 'vitest';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ThrottleGuard, THROTTLE_KEY } from './throttle.guard.js';

describe('ThrottleGuard', () => {
  let guard: ThrottleGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ThrottleGuard, Reflector],
    }).compile();
    guard = module.get(ThrottleGuard);
  });

  function makeContext(ip: string, opts?: { windowMs?: number; maxAttempts?: number }) {
    const req = { ip, socket: { remoteAddress: 'fallback' }, headers: {} } as any;
    const handler = () => {};
    if (opts) Reflect.defineMetadata(THROTTLE_KEY, opts, handler);
    return {
      switchToHttp: () => ({ getRequest: () => req }),
      getHandler: () => handler,
      getClass: () => class {},
    } as any;
  }

  it('allows requests under the limit', () => {
    const ctx = makeContext('1.2.3.4', { windowMs: 60000, maxAttempts: 3 });
    expect(guard.canActivate(ctx)).toBe(true);
    expect(guard.canActivate(ctx)).toBe(true);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('blocks requests over the limit', () => {
    const ctx = makeContext('1.2.3.5', { windowMs: 60000, maxAttempts: 2 });
    expect(guard.canActivate(ctx)).toBe(true);
    expect(guard.canActivate(ctx)).toBe(true);
    try { guard.canActivate(ctx); expect.fail('should throw'); }
    catch (e: any) { expect(e).toBeInstanceOf(HttpException); expect(e.getStatus()).toBe(429); }
  });

  it('tracks different IPs independently', () => {
    const ctx1 = makeContext('10.0.0.1', { windowMs: 60000, maxAttempts: 2 });
    const ctx2 = makeContext('10.0.0.2', { windowMs: 60000, maxAttempts: 2 });
    expect(guard.canActivate(ctx1)).toBe(true);
    expect(guard.canActivate(ctx2)).toBe(true);
    // ctx1 exhausts its 2 attempts
    expect(guard.canActivate(ctx1)).toBe(true);
    try { guard.canActivate(ctx1); expect.fail('should throw'); }
    catch (e: any) { expect(e).toBeInstanceOf(HttpException); expect(e.getStatus()).toBe(429); }
    // ctx2 still has remaining attempts
    expect(guard.canActivate(ctx2)).toBe(true);
  });

  it('uses fallback socket address when ip is missing', () => {
    const req = { socket: { remoteAddress: 'fallback-ip' } } as any;
    const handler = () => {};
    Reflect.defineMetadata(THROTTLE_KEY, { windowMs: 60000, maxAttempts: 5 }, handler);
    const ctx = {
      switchToHttp: () => ({ getRequest: () => req }),
      getHandler: () => handler,
      getClass: () => class {},
    } as any;
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('uses defaults when no decorator metadata', () => {
    const ctx = {
      switchToHttp: () => ({ getRequest: () => ({ ip: '1.1.1.1', socket: {} }) }),
      getHandler: () => (() => {}),
      getClass: () => class {},
    } as any;
    for (let i = 0; i < 5; i++) expect(guard.canActivate(ctx)).toBe(true);
    try { guard.canActivate(ctx); expect.fail('should throw'); }
    catch (e: any) { expect(e).toBeInstanceOf(HttpException); expect(e.getStatus()).toBe(429); }
  });

  it('throws 429 HttpException with retryAfter', () => {
    const ctx = makeContext('1.2.3.6', { windowMs: 60000, maxAttempts: 1 });
    guard.canActivate(ctx);
    try {
      guard.canActivate(ctx);
    } catch (e: any) {
      expect(e.getStatus()).toBe(429);
      expect(e.response.retryAfter).toBeGreaterThan(0);
    }
  });
});
