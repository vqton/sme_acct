import type { UserGroup } from '../domain/entities/UserGroup.js';
import type { UserGroupRepository } from '../domain/repositories/UserGroupRepository.js';
import { UserGroupNotFoundError, UserGroupNameTakenError } from '../domain/errors/UserManagementErrors.js';

export interface CreateGroupInput {
  name: string;
  description?: string;
}

export interface UpdateGroupInput {
  name?: string;
  description?: string;
}

export class UserGroupService {
  constructor(private groupRepo: UserGroupRepository) {}

  createGroup(input: CreateGroupInput): UserGroup {
    if (!input.name.trim()) {
      throw new Error('Group name is required');
    }

    const existing = this.groupRepo.findAll().find((g) => g.name.toLowerCase() === input.name.trim().toLowerCase());
    if (existing) {
      throw new UserGroupNameTakenError(input.name.trim());
    }

    const group: UserGroup = {
      id: 0,
      name: input.name.trim(),
      description: input.description?.trim(),
      isActive: true,
      createdAt: new Date(),
    };
    return this.groupRepo.save(group);
  }

  listGroups(): UserGroup[] {
    return this.groupRepo.findAll();
  }

  getGroup(id: number): UserGroup | null {
    return this.groupRepo.findById(id);
  }

  updateGroup(id: number, input: UpdateGroupInput): UserGroup {
    const group = this.groupRepo.findById(id);
    if (!group) throw new UserGroupNotFoundError(id);

    if (input.name) {
      const duplicate = this.groupRepo.findAll().find(
        (g) => g.id !== id && g.name.toLowerCase() === input.name!.trim().toLowerCase(),
      );
      if (duplicate) throw new UserGroupNameTakenError(input.name.trim());
    }

    const updated: UserGroup = {
      ...group,
      name: input.name?.trim() ?? group.name,
      description: input.description?.trim() ?? group.description,
      updatedAt: new Date(),
    };
    return this.groupRepo.save(updated);
  }

  deleteGroup(id: number): void {
    const group = this.groupRepo.findById(id);
    if (!group) throw new UserGroupNotFoundError(id);
    this.groupRepo.delete(id);
  }

  toggleGroupActive(id: number, isActive: boolean): UserGroup {
    const group = this.groupRepo.findById(id);
    if (!group) throw new UserGroupNotFoundError(id);
    const updated: UserGroup = { ...group, isActive, updatedAt: new Date() };
    return this.groupRepo.save(updated);
  }
}
