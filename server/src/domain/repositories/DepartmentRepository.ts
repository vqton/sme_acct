import type { Department } from '../entities/Department.js';

export interface DepartmentTreeItem extends Department {
  children: DepartmentTreeItem[];
}

export interface DepartmentRepository {
  findById(id: number): Department | null;
  findByCompanyId(companyId: number): Department[];
  findByCode(companyId: number, code: string): Department | null;
  findChildren(parentId: number): Department[];
  findSubtree(pathPrefix: string): Department[];
  findAncestors(path: string, companyId: number): Department[];
  save(entity: Department): Department;
  updateSubtreePaths(oldPathPrefix: string, newPathPrefix: string, depthDelta: number): void;
  delete(id: number): void;
}
