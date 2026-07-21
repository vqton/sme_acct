import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
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

const ERROR_STATUS: Array<[new (...args: unknown[]) => Error, HttpStatus]> = [
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

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (exception instanceof Error) {
      for (const [ErrorClass, status] of ERROR_STATUS) {
        if (exception instanceof ErrorClass) {
          res.status(status).json({ error: exception.message });
          return;
        }
      }
    }

    if (exception instanceof Error && 'status' in exception) {
      const err = exception as Error & { status: number };
      res.status(err.status).json({ error: exception.message });
      return;
    }

    console.error(`Unhandled: ${exception instanceof Error ? exception.message : exception}`);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
  }
}
