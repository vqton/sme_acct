import type { UserDepartment } from '../entities/UserDepartment.js';

export interface UserDepartmentRepository {
  findByUserId(userId: string): UserDepartment[];
  findByDepartmentId(departmentId: string): UserDepartment[];
  findOne(userId: string, departmentId: string): UserDepartment | null;
  save(entity: UserDepartment): UserDepartment;
  removePrimaryFlag(userId: string): void;
  delete(userId: string, departmentId: string): void;
  countByDepartmentId(departmentId: string): number;
}
