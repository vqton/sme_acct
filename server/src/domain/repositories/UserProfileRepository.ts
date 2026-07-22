import type { UserProfile } from '../entities/UserProfile.js';

export interface UserProfileRepository {
  findByUserId(userId: string): UserProfile | null;
  save(profile: UserProfile): UserProfile;
  delete(userId: string): void;
}
