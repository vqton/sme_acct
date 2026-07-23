import type { RefreshToken } from '../entities/RefreshToken.js';

export interface RefreshTokenRepository {
  findValid(tokenHash: string): RefreshToken | null;
  findById(id: number): RefreshToken | null;
  save(token: RefreshToken): void;
  findAllActiveForUser(userId: number): RefreshToken[];
  revoke(id: number): void;
  revokeAllForUser(userId: number): void;
  revokeAllExcept(userId: number, excludeId: number): void;
  touch(id: number): void;
}
