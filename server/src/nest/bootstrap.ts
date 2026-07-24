import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

export async function createNestApp() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api', { exclude: ['/', 'metrics'] });
  app.enableCors();
  app.useGlobalFilters(app.get(HttpExceptionFilter));
  app.enableShutdownHooks();
  return app;
}
