import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppMetricsModule } from './metrics.module.js';

describe('AppMetricsModule', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      imports: [AppMetricsModule],
    }).compile();

    app = mod.createNestApplication();
    app.setGlobalPrefix('api', { exclude: ['/', 'metrics'] });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /metrics returns prometheus format', async () => {
    const res = await request(app.getHttpServer()).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/plain');
    expect(res.text).toContain('process_cpu_seconds_total');
  });
});
