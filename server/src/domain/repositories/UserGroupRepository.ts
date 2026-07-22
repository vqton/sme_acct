import type { UserGroup } from '../entities/UserGroup.js';
import type { UserGroupMember } from '../entities/UserGroupMember.js';

export interface UserGroupRepository {
  findById(id: string): UserGroup | null;
  findAll(): UserGroup[];
  save(group: UserGroup): UserGroup;
  delete(id: string): void;

  getMembers(groupId: string): UserGroupMember[];
  addMember(member: UserGroupMember): void;
  removeMember(groupId: string, userId: string): void;
  getGroupsForUser(userId: string): UserGroup[];
}
