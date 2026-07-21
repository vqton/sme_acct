export interface RateLimiterOptions {
  windowMs: number;
  maxAttempts: number;
}

interface AttemptRecord {
  timestamps: number[];
}

export class RateLimiter {
  private store = new Map<string, AttemptRecord>();
  private windowMs: number;
  private maxAttempts: number;

  constructor(options: RateLimiterOptions) {
    this.windowMs = options.windowMs;
    this.maxAttempts = options.maxAttempts;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const record = this.store.get(key);
    if (!record) {
      this.store.set(key, { timestamps: [now] });
      return true;
    }

    const cutoff = now - this.windowMs;
    record.timestamps = record.timestamps.filter((t) => t > cutoff);

    if (record.timestamps.length >= this.maxAttempts) {
      return false;
    }

    record.timestamps.push(now);
    return true;
  }

  getRemaining(key: string): number {
    const now = Date.now();
    const record = this.store.get(key);
    if (!record) return this.maxAttempts;

    const cutoff = now - this.windowMs;
    const recent = record.timestamps.filter((t) => t > cutoff);
    return Math.max(0, this.maxAttempts - recent.length);
  }

  getRetryAfter(key: string): number {
    const record = this.store.get(key);
    if (!record || record.timestamps.length === 0) return 0;

    const oldest = record.timestamps[0];
    const elapsed = Date.now() - oldest;
    return Math.max(0, Math.ceil((this.windowMs - elapsed) / 1000));
  }

  cleanup(): void {
    const now = Date.now();
    const cutoff = now - this.windowMs;
    for (const [key, record] of this.store) {
      record.timestamps = record.timestamps.filter((t) => t > cutoff);
      if (record.timestamps.length === 0) {
        this.store.delete(key);
      }
    }
  }
}
