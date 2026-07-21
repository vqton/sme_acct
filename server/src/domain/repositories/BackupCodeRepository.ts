import type { BackupCode } from '../entities/BackupCode.js';

export interface BackupCodeRepository {
  savemany(userId: string, codeHashes: string[]): void;
  findValid(userId: string, codeHash: string): BackupCode | null;
  markUsed(id: string): void;
  deleteAllForUser(userId: string): void;
}
