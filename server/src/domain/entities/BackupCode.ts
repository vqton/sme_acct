export interface BackupCode {
  id: number;
  userId: number;
  codeHash: string;
  usedAt: Date | null;
  createdAt: Date;
}
