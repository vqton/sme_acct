export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid credentials');
    this.name = 'InvalidCredentialsError';
  }
}

export class AccountDisabledError extends Error {
  constructor() {
    super('Account disabled');
    this.name = 'AccountDisabledError';
  }
}

export class UsernameTakenError extends Error {
  constructor() {
    super('Username already taken');
    this.name = 'UsernameTakenError';
  }
}

export class EmailTakenError extends Error {
  constructor() {
    super('Email already in use');
    this.name = 'EmailTakenError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AccountLockedError extends Error {
  constructor(retryAfterSeconds: number) {
    super(`Account locked due to too many failed attempts. Try again in ${retryAfterSeconds} seconds.`);
    this.name = 'AccountLockedError';
  }
}

export class InvalidResetTokenError extends Error {
  constructor() {
    super('Invalid or expired reset token');
    this.name = 'InvalidResetTokenError';
  }
}

export class NoCompaniesAssignedError extends Error {
  constructor() {
    super('No companies assigned');
    this.name = 'NoCompaniesAssignedError';
  }
}

export class CompanyAccessError extends Error {
  constructor(companyId: string) {
    super(`User is not a member of company ${companyId}`);
    this.name = 'CompanyAccessError';
  }
}

export class TwoFactorRequiredError extends Error {
  constructor(tempToken: string) {
    super('Two-factor authentication required');
    this.name = 'TwoFactorRequiredError';
    this.tempToken = tempToken;
  }
  tempToken: string;
}

export class InvalidTOTPError extends Error {
  constructor() {
    super('Invalid verification code');
    this.name = 'InvalidTOTPError';
  }
}

export class BackupCodeUsedError extends Error {
  constructor() {
    super('Invalid backup code');
    this.name = 'BackupCodeUsedError';
  }
}
