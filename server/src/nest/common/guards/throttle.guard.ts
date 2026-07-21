import { Injectable, CanActivate, ExecutionContext, HttpException, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { RateLimiter } from '../../../presentation/middleware/rateLimiter.js';

export const THROTTLE_KEY = 'throttle';

export interface ThrottleOptions {
  windowMs: number;
  maxAttempts: number;
}

@Injectable()
export class ThrottleGuard implements CanActivate {
  private limiters = new Map<string, RateLimiter>();

  constructor(@Inject(Reflector) private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const opts = this.reflector.getAllAndOverride<ThrottleOptions>(THROTTLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const windowMs = opts?.windowMs ?? 15 * 60 * 1000;
    const maxAttempts = opts?.maxAttempts ?? 5;

    const req = context.switchToHttp().getRequest<Request>();
    const key: string = (req.ip ?? req.socket.remoteAddress ?? 'unknown') as string;

    const configKey = `${windowMs}:${maxAttempts}`;
    if (!this.limiters.has(configKey)) {
      this.limiters.set(configKey, new RateLimiter({ windowMs, maxAttempts }));
    }
    const limiter = this.limiters.get(configKey)!;

    if (!limiter.isAllowed(key)) {
      const retryAfter = limiter.getRetryAfter(key);
      throw new HttpException(
        { error: 'Too many requests. Please try again later.', retryAfter },
        429,
      );
    }

    return true;
  }
}
