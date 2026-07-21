import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimiter } from './rateLimiter.js';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    vi.useFakeTimers();
    limiter = new RateLimiter({ windowMs: 15 * 60 * 1000, maxAttempts: 5 });
  });

  it('allows requests under the limit', () => {
    for (let i = 0; i < 5; i++) {
      expect(limiter.isAllowed('ip-1')).toBe(true);
    }
  });

  it('blocks requests over the limit', () => {
    for (let i = 0; i < 5; i++) {
      limiter.isAllowed('ip-1');
    }
    expect(limiter.isAllowed('ip-1')).toBe(false);
  });

  it('tracks different keys independently', () => {
    for (let i = 0; i < 5; i++) {
      limiter.isAllowed('ip-1');
    }
    expect(limiter.isAllowed('ip-1')).toBe(false);
    expect(limiter.isAllowed('ip-2')).toBe(true);
  });

  it('resets after window expires', () => {
    for (let i = 0; i < 5; i++) {
      limiter.isAllowed('ip-1');
    }
    expect(limiter.isAllowed('ip-1')).toBe(false);

    vi.advanceTimersByTime(15 * 60 * 1000 + 1);

    expect(limiter.isAllowed('ip-1')).toBe(true);
  });

  it('returns remaining attempts', () => {
    expect(limiter.getRemaining('ip-1')).toBe(5);
    limiter.isAllowed('ip-1');
    expect(limiter.getRemaining('ip-1')).toBe(4);
  });

  it('returns retry-after seconds when blocked', () => {
    for (let i = 0; i < 5; i++) {
      limiter.isAllowed('ip-1');
    }
    const retryAfter = limiter.getRetryAfter('ip-1');
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(15 * 60);
  });

  it('cleans up old entries', () => {
    limiter.isAllowed('ip-1');
    vi.advanceTimersByTime(16 * 60 * 1000);
    limiter.cleanup();

    expect(limiter.getRemaining('ip-1')).toBe(5);
  });
});
