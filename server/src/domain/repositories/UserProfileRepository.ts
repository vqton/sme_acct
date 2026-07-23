import type { UserProfile } from '../entities/UserProfile.js';

export interface UserProfileRepository {
  findByUserId(userId: number): UserProfile | null;
  save(profile: UserProfile): UserProfile;
  delete(userId: number): void;
}
