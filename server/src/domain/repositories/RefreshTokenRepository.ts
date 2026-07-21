import type { RefreshToken } from '../entities/RefreshToken.js';

export interface RefreshTokenRepository {
  findValid(tokenHash: string): RefreshToken | null;
  findById(id: string): RefreshToken | null;
  save(token: RefreshToken): void;
  findAllActiveForUser(userId: string): RefreshToken[];
  revoke(id: string): void;
  revokeAllForUser(userId: string): void;
  revokeAllExcept(userId: string, excludeId: string): void;
  touch(id: string): void;
}
