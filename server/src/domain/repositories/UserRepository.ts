import { Repository } from './Repository.js';
import { User } from '../entities/User.js';

export interface UserRepository extends Repository<User, string> {
  findByUsername(username: string): User | null;
  findByEmail(email: string): User | null;
}
