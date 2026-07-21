import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Injectable, Optional, Inject } from '@nestjs/common';
import { Response, Request } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { I18nService } from 'nestjs-i18n';
import {
  InvalidCredentialsError,
  AccountDisabledError,
  AccountLockedError,
  UsernameTakenError,
  EmailTakenError,
  ValidationError,
  InvalidResetTokenError,
  NoCompaniesAssignedError,
  CompanyAccessError,
  InvalidTOTPError,
} from '../../../domain/errors/AuthErrors.js';

const ERROR_STATUS: Array<[new (...args: any[]) => Error, HttpStatus]> = [
  [InvalidCredentialsError, HttpStatus.UNAUTHORIZED],
  [AccountDisabledError, HttpStatus.FORBIDDEN],
  [AccountLockedError, HttpStatus.LOCKED],
  [UsernameTakenError, HttpStatus.CONFLICT],
  [EmailTakenError, HttpStatus.CONFLICT],
  [ValidationError, HttpStatus.BAD_REQUEST],
  [InvalidResetTokenError, HttpStatus.BAD_REQUEST],
  [NoCompaniesAssignedError, HttpStatus.UNAUTHORIZED],
  [CompanyAccessError, HttpStatus.FORBIDDEN],
  [InvalidTOTPError, HttpStatus.UNAUTHORIZED],
];

@Injectable()
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    @Optional() @Inject(PinoLogger) private logger?: PinoLogger,
    @Inject(I18nService) private i18n?: I18nService<Record<string, unknown>>,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    for (const [ErrorClass, status] of ERROR_STATUS) {
      if (exception instanceof ErrorClass) {
        const lang = this.resolveLang(req);
        const errName = exception.name;
        const translated = this.translate(`errors.${errName}`, lang, exception.message);

        res.status(status).json({ error: translated });
        return;
      }
    }

    if (exception instanceof Error && 'status' in exception) {
      const err = exception as Error & { status: number };
      res.status(err.status).json({ error: exception.message });
      return;
    }

    const logFn = this.logger?.error.bind(this.logger) ?? console.error;
    logFn(`Unhandled: ${exception instanceof Error ? exception.message : exception}`);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: this.translate('errors.InternalServerError', this.resolveLang(req), 'Internal server error'),
    });
  }

  private translate(key: string, lang: string, fallback: string): string {
    try {
      return this.i18n?.t(key, { lang, defaultValue: fallback }) ?? fallback;
    } catch {
      return fallback;
    }
  }

  private resolveLang(req: Request): string {
    const acceptLanguage = req.headers['accept-language'];
    if (!acceptLanguage) return 'en';
    if (acceptLanguage.startsWith('vi')) return 'vi';
    return 'en';
  }
}
