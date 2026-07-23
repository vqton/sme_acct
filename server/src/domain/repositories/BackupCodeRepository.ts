import type { BackupCode } from '../entities/BackupCode.js';

export interface BackupCodeRepository {
  savemany(userId: number, codeHashes: string[]): void;
  findValid(userId: number, codeHash: string): BackupCode | null;
  markUsed(id: number): void;
  deleteAllForUser(userId: number): void;
}
