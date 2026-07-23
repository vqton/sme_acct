export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  passwordHash: string;
  isActive: boolean;
  twoFactorEnabled: boolean;
  totpSecret?: string;
  failedLoginAttempts: number;
  lockoutUntil: Date | null;
  createdAt: Date;
  updatedAt?: Date;
}
