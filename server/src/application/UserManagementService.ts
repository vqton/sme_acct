import crypto from 'crypto';
import type { User } from '../domain/entities/User.js';
import type { UserProfile } from '../domain/entities/UserProfile.js';
import type { UserGroup } from '../domain/entities/UserGroup.js';
import type { UserRepository, UserSearchParams } from '../domain/repositories/UserRepository.js';
import type { UserProfileRepository } from '../domain/repositories/UserProfileRepository.js';
import type { UserGroupRepository } from '../domain/repositories/UserGroupRepository.js';
import type { RoleRepository } from '../domain/repositories/RoleRepository.js';
import { UserNotFoundError } from '../domain/errors/UserManagementErrors.js';

export interface UserListItem extends Omit<User, 'passwordHash' | 'totpSecret' | 'failedLoginAttempts' | 'lockoutUntil'> {
  phone?: string;
  position?: string;
  department?: string;
  avatarUrl?: string;
  roles: string[];
}

export interface UpdateUserInput {
  fullName?: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  avatarUrl?: string;
  notes?: string;
}

export class UserManagementService {
  constructor(
    private userRepo: UserRepository,
    private profileRepo: UserProfileRepository,
    private groupRepo: UserGroupRepository,
    private roleRepo: RoleRepository,
  ) {}

  private toListItem(user: User): UserListItem {
    const profile = this.profileRepo.findByUserId(user.id);
    const roles = this.roleRepo.getUserRoles(user.id).map((r) => r.toString());
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      isActive: user.isActive,
      twoFactorEnabled: user.twoFactorEnabled,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      phone: profile?.phone,
      position: profile?.position,
      department: profile?.department,
      avatarUrl: profile?.avatarUrl,
      roles,
    };
  }

  listUsers(params?: UserSearchParams): UserListItem[] {
    const users = this.userRepo.search(params ?? {});
    return users.map((u) => this.toListItem(u));
  }

  countUsers(params?: UserSearchParams): number {
    return this.userRepo.count(params ?? {});
  }

  getUser(id: number): UserListItem | null {
    const user = this.userRepo.findById(id);
    if (!user) return null;
    return this.toListItem(user);
  }

  updateUser(id: number, input: UpdateUserInput): UserListItem {
    const user = this.userRepo.findById(id);
    if (!user) throw new UserNotFoundError(id);

    const updatedUser: User = {
      ...user,
      fullName: input.fullName ?? user.fullName,
      email: input.email ?? user.email,
      updatedAt: new Date(),
    };
    this.userRepo.save(updatedUser);

    const profileExists = this.profileRepo.findByUserId(id);
    const profile: UserProfile = {
      userId: id,
      phone: input.phone ?? profileExists?.phone,
      position: input.position ?? profileExists?.position,
      department: input.department ?? profileExists?.department,
      avatarUrl: input.avatarUrl ?? profileExists?.avatarUrl,
      notes: input.notes ?? profileExists?.notes,
      updatedAt: new Date(),
    };
    this.profileRepo.save(profile);

    return this.toListItem(this.userRepo.findById(id)!);
  }

  deleteUser(id: number): void {
    const user = this.userRepo.findById(id);
    if (!user) throw new UserNotFoundError(id);
    this.userRepo.delete(id);
  }

  activateUser(id: number): UserListItem {
    const user = this.userRepo.findById(id);
    if (!user) throw new UserNotFoundError(id);
    const updated = this.userRepo.save({ ...user, isActive: true, updatedAt: new Date() });
    return this.toListItem(updated);
  }

  deactivateUser(id: number): UserListItem {
    const user = this.userRepo.findById(id);
    if (!user) throw new UserNotFoundError(id);
    const updated = this.userRepo.save({ ...user, isActive: false, updatedAt: new Date() });
    return this.toListItem(updated);
  }

  assignRole(userId: number, role: string): void {
    const user = this.userRepo.findById(userId);
    if (!user) throw new UserNotFoundError(userId);
    this.roleRepo.assignRole(userId, role as any);
  }

  removeRole(userId: number, role: string): void {
    this.roleRepo.removeRole(userId, role as any);
  }

  getUserRoles(userId: number): string[] {
    return this.roleRepo.getUserRoles(userId).map((r) => r.toString());
  }

  addUserToGroup(userId: number, groupId: number): void {
    const user = this.userRepo.findById(userId);
    if (!user) throw new UserNotFoundError(userId);
    this.groupRepo.addMember({ groupId, userId, joinedAt: new Date() });
  }

  removeUserFromGroup(userId: number, groupId: number): void {
    this.groupRepo.removeMember(groupId, userId);
  }

  getUserGroups(userId: number): UserGroup[] {
    return this.groupRepo.getGroupsForUser(userId);
  }
}
