import { Repository } from './Repository.js';
import { User } from '../entities/User.js';

export interface UserSearchParams {
  query?: string;
  isActive?: boolean;
  role?: string;
  groupId?: string;
  offset?: number;
  limit?: number;
}

export interface UserRepository extends Repository<User, string> {
  findByUsername(username: string): User | null;
  findByEmail(email: string): User | null;
  search(params: UserSearchParams): User[];
  count(params: UserSearchParams): number;
}
