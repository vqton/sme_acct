import type { Department } from '../entities/Department.js';

export interface DepartmentTreeItem extends Department {
  children: DepartmentTreeItem[];
}

export interface DepartmentRepository {
  findById(id: string): Department | null;
  findByCompanyId(companyId: string): Department[];
  findByCode(companyId: string, code: string): Department | null;
  findChildren(parentId: string): Department[];
  findSubtree(pathPrefix: string): Department[];
  findAncestors(path: string, companyId: string): Department[];
  save(entity: Department): Department;
  updateSubtreePaths(oldPathPrefix: string, newPathPrefix: string, depthDelta: number): void;
  delete(id: string): void;
}
