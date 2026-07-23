export interface UserProfile {
  userId: number;
  phone?: string;
  position?: string;
  department?: string;
  avatarUrl?: string;
  notes?: string;
  updatedAt?: Date;
}
