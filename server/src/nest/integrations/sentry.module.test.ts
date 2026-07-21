import { describe, it, expect, beforeAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { AppSentryModule } from './sentry.module.js';

describe('AppSentryModule', () => {
  it('compiles without DSN configured', async () => {
    const mod = await Test.createTestingModule({
      imports: [AppSentryModule],
    }).compile();
    expect(mod).toBeDefined();
  });

  it('provides SentryExceptionFilter', async () => {
    const mod = await Test.createTestingModule({
      imports: [AppSentryModule],
    }).compile();
    const filter = mod.get('SENTRY_FILTER');
    expect(filter).toBeDefined();
  });
});
