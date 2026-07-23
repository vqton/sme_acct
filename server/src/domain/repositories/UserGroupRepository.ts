import type { UserGroup } from '../entities/UserGroup.js';
import type { UserGroupMember } from '../entities/UserGroupMember.js';

export interface UserGroupRepository {
  findById(id: number): UserGroup | null;
  findAll(): UserGroup[];
  save(group: UserGroup): UserGroup;
  delete(id: number): void;

  getMembers(groupId: number): UserGroupMember[];
  addMember(member: UserGroupMember): void;
  removeMember(groupId: number, userId: number): void;
  getGroupsForUser(userId: number): UserGroup[];
}
