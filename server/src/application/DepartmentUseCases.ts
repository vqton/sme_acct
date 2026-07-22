import type { Department, CreateDepartmentInput } from '../domain/entities/Department.js';
import { createDepartment, deactivateDepartment, reactivateDepartment, dissolveDepartment, reparentDepartment } from '../domain/entities/Department.js';
import { createUserDepartment, type UserDepartment, type CreateUserDepartmentInput } from '../domain/entities/UserDepartment.js';
import { DepartmentStatus, DepartmentType } from '../domain/enums/DepartmentEnums.js';
import type { DepartmentRepository } from '../domain/repositories/DepartmentRepository.js';
import type { UserDepartmentRepository } from '../domain/repositories/UserDepartmentRepository.js';

export class DepartmentUseCases {
  constructor(
    private readonly deptRepo: DepartmentRepository,
    private readonly userDeptRepo: UserDepartmentRepository,
  ) {}

  create(data: CreateDepartmentInput): Department {
    const existing = this.deptRepo.findByCode(data.companyId, data.code);
    if (existing) throw new Error('Department code already exists');

    let parent: Department | null = null;
    if (data.parentId) {
      parent = this.deptRepo.findById(data.parentId);
      if (!parent) throw new Error('Parent department not found');
      if (parent.status !== DepartmentStatus.Active) throw new Error('Parent department is not active');
    }

    const dept = createDepartment(data, parent ?? undefined);
    return this.deptRepo.save(dept);
  }

  getById(id: string): Department {
    const dept = this.deptRepo.findById(id);
    if (!dept) throw new Error('Department not found');
    return dept;
  }

  list(companyId: string): Department[] {
    return this.deptRepo.findByCompanyId(companyId);
  }

  update(id: string, data: Partial<Department>): Department {
    const dept = this.getById(id);
    const updated = { ...dept, ...data, updatedAt: new Date() };
    return this.deptRepo.save(updated);
  }

  deactivate(id: string): Department {
    const dept = this.getById(id);
    const children = this.deptRepo.findChildren(id);
    if (children.some((c) => c.status === DepartmentStatus.Active)) {
      throw new Error('Cannot deactivate department with active children');
    }
    if (this.userDeptRepo.countByDepartmentId(id) > 0) {
      throw new Error('Cannot deactivate department with assigned users');
    }
    return this.deptRepo.save(deactivateDepartment(dept));
  }

  reactivate(id: string): Department {
    const dept = this.getById(id);
    if (dept.status === DepartmentStatus.Dissolved) {
      throw new Error('Cannot reactivate dissolved department');
    }
    return this.deptRepo.save(reactivateDepartment(dept));
  }

  dissolve(id: string, dissolutionDate?: string): Department {
    const dept = this.getById(id);
    const children = this.deptRepo.findChildren(id);
    if (children.length > 0) {
      throw new Error('Cannot dissolve department with children');
    }
    if (this.userDeptRepo.countByDepartmentId(id) > 0) {
      throw new Error('Cannot dissolve department with assigned users');
    }
    return this.deptRepo.save(dissolveDepartment(dept, dissolutionDate));
  }

  reparent(id: string, newParentId: string): Department {
    const dept = this.getById(id);
    const newParent = this.deptRepo.findById(newParentId);
    if (!newParent) throw new Error('New parent not found');

    const childIds = this.deptRepo.findSubtree(dept.path).map((d) => d.id);
    if (childIds.includes(newParentId)) {
      throw new Error('Cannot reparent to its own descendant');
    }

    const oldPath = dept.path;
    const updated = reparentDepartment(dept, newParent);
    const saved = this.deptRepo.save(updated);

    const depthDelta = (updated as any)._depthDelta as number;
    this.deptRepo.updateSubtreePaths(oldPath + '/', updated.path + '/', depthDelta);

    return saved;
  }

  getTree(companyId: string): Department[] {
    return this.deptRepo.findByCompanyId(companyId);
  }

  getChildren(parentId: string): Department[] {
    return this.deptRepo.findChildren(parentId);
  }

  delete(id: string): void {
    const dept = this.getById(id);
    const children = this.deptRepo.findChildren(id);
    if (children.length > 0) {
      throw new Error('Cannot delete department with children');
    }
    this.deptRepo.delete(id);
  }

  // ─── User-Department Assignment ───────────────────────

  assignUser(data: CreateUserDepartmentInput): UserDepartment {
    const dept = this.deptRepo.findById(data.departmentId);
    if (!dept) throw new Error('Department not found');

    if (data.isPrimary) {
      this.userDeptRepo.removePrimaryFlag(data.userId);
    }

    const ud = createUserDepartment(data);
    return this.userDeptRepo.save(ud);
  }

  changePrimaryDepartment(userId: string, departmentId: string): void {
    this.userDeptRepo.removePrimaryFlag(userId);
    const ud = this.userDeptRepo.findOne(userId, departmentId);
    if (ud) {
      ud.isPrimary = true;
      this.userDeptRepo.save(ud);
    }
  }

  removeUserFromDepartment(userId: string, departmentId: string): void {
    const ud = this.userDeptRepo.findOne(userId, departmentId);
    if (!ud) throw new Error('User not assigned to this department');

    if (ud.isPrimary) {
      const others = this.userDeptRepo.findByUserId(userId);
      if (others.length <= 1) {
        throw new Error('User must belong to at least 1 department');
      }
    }
    this.userDeptRepo.delete(userId, departmentId);

    if (ud.isPrimary) {
      const remaining = this.userDeptRepo.findByUserId(userId);
      if (remaining.length > 0) {
        remaining[0].isPrimary = true;
        this.userDeptRepo.save(remaining[0]);
      }
    }
  }

  getDepartmentUsers(departmentId: string): UserDepartment[] {
    return this.userDeptRepo.findByDepartmentId(departmentId);
  }

  getUserDepartments(userId: string): UserDepartment[] {
    return this.userDeptRepo.findByUserId(userId);
  }
}
