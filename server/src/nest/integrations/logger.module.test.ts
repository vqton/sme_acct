import { describe, it, expect } from 'vitest';
import { Test } from '@nestjs/testing';
import { PinoLogger } from 'nestjs-pino';
import { AppLoggerModule } from './logger.module.js';

describe('AppLoggerModule', () => {
  it('compiles and provides PinoLogger', async () => {
    const mod = await Test.createTestingModule({
      imports: [AppLoggerModule],
    }).compile();
    const logger = await mod.resolve(PinoLogger);
    expect(logger).toBeDefined();
  });

  it('logs without error', async () => {
    const mod = await Test.createTestingModule({
      imports: [AppLoggerModule],
    }).compile();
    const logger = await mod.resolve(PinoLogger);
    expect(() => logger.info('test message')).not.toThrow();
  });
});
