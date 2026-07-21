import { Module, Global, OnApplicationBootstrap } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';

export const SENTRY_FILTER = 'SENTRY_FILTER';

@Global()
@Module({
  providers: [
    {
      provide: SENTRY_FILTER,
      useFactory: () => ({
        captureException: (exception: unknown, context?: { userId?: string; extra?: Record<string, unknown> }) => {
          if (process.env.SENTRY_DSN) {
            Sentry.captureException(exception, context ? { user: context.userId ? { id: context.userId } : undefined, extra: context.extra } : undefined);
          }
        },
      }),
    },
  ],
  exports: [SENTRY_FILTER],
})
export class AppSentryModule implements OnApplicationBootstrap {
  onApplicationBootstrap() {
    Sentry.init({
      dsn: process.env.SENTRY_DSN ?? '',
      environment: process.env.NODE_ENV ?? 'development',
      integrations: [Sentry.nestIntegration()],
      tracesSampleRate: process.env.SENTRY_DSN ? 1.0 : 0,
      enabled: !!process.env.SENTRY_DSN,
    });
  }
}
