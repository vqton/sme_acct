import type { UserDepartment } from '../entities/UserDepartment.js';

export interface UserDepartmentRepository {
  findByUserId(userId: number): UserDepartment[];
  findByDepartmentId(departmentId: number): UserDepartment[];
  findOne(userId: number, departmentId: number): UserDepartment | null;
  save(entity: UserDepartment): UserDepartment;
  removePrimaryFlag(userId: number): void;
  delete(userId: number, departmentId: number): void;
  countByDepartmentId(departmentId: number): number;
}
