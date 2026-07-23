import type { DepartmentRepository } from '../../domain/repositories/DepartmentRepository.js';
import { DepartmentType, DepartmentStatus, BudgetControlLevel } from '../../domain/enums/DepartmentEnums.js';
import type { Department } from '../../domain/entities/Department.js';

interface StandardDept {
  code: string;
  name: string;
  nameEnglish: string;
  departmentType: DepartmentType;
  parentCode?: string;
  sortOrder: number;
  managerTitle?: string;
}

const STANDARD_DEPARTMENTS: StandardDept[] = [
  { code: 'BP01', name: 'Ban Giám đốc', nameEnglish: 'Board of Management', departmentType: DepartmentType.InvestmentCenter, sortOrder: 1 },
  { code: 'BP0101', name: 'Văn phòng Giám đốc', nameEnglish: 'CEO Office', departmentType: DepartmentType.SupportCenter, parentCode: 'BP01', sortOrder: 1, managerTitle: 'Chánh Văn phòng' },
  { code: 'BP0102', name: 'Bộ phận Kiểm toán Nội bộ', nameEnglish: 'Internal Audit', departmentType: DepartmentType.SupportCenter, parentCode: 'BP01', sortOrder: 2, managerTitle: 'Trưởng Bộ phận Kiểm toán' },
  { code: 'BP02', name: 'Phòng Hành chính - Nhân sự', nameEnglish: 'HR & Administration', departmentType: DepartmentType.SupportCenter, sortOrder: 2, managerTitle: 'Trưởng phòng HC-NS' },
  { code: 'BP03', name: 'Phòng Kế toán - Tài chính', nameEnglish: 'Accounting & Finance', departmentType: DepartmentType.CostCenter, sortOrder: 3, managerTitle: 'Kế toán trưởng' },
  { code: 'BP04', name: 'Phòng Kinh doanh', nameEnglish: 'Sales Department', departmentType: DepartmentType.ProfitCenter, sortOrder: 4, managerTitle: 'Trưởng phòng Kinh doanh' },
  { code: 'BP05', name: 'Phòng Kỹ thuật', nameEnglish: 'Engineering Department', departmentType: DepartmentType.CostCenter, sortOrder: 5, managerTitle: 'Trưởng phòng Kỹ thuật' },
  { code: 'BP06', name: 'Phòng Sản xuất', nameEnglish: 'Production Department', departmentType: DepartmentType.ProfitCenter, sortOrder: 6, managerTitle: 'Trưởng phòng Sản xuất' },
  { code: 'BP07', name: 'Phòng Quản lý Chất lượng', nameEnglish: 'Quality Control', departmentType: DepartmentType.SupportCenter, sortOrder: 7, managerTitle: 'Trưởng phòng QLCL' },
  { code: 'BP08', name: 'Phòng Công nghệ Thông tin', nameEnglish: 'IT Department', departmentType: DepartmentType.SupportCenter, sortOrder: 8, managerTitle: 'Trưởng phòng CNTT' },
  { code: 'BP09', name: 'Phòng Marketing', nameEnglish: 'Marketing Department', departmentType: DepartmentType.CostCenter, sortOrder: 9, managerTitle: 'Trưởng phòng Marketing' },
  { code: 'BP10', name: 'Phòng Xuất Nhập Khẩu', nameEnglish: 'Import-Export Department', departmentType: DepartmentType.ProfitCenter, sortOrder: 10, managerTitle: 'Trưởng phòng XNK' },
];

export class DepartmentSeeder {
  constructor(private readonly deptRepo: DepartmentRepository) {}

  seed(companyId: number, createdByUserId?: number): number {
    const created: Department[] = [];
    const byCode = new Map<string, Department>();

    for (const defn of STANDARD_DEPARTMENTS) {
      const existing = this.deptRepo.findByCode(companyId, defn.code);
      if (existing) {
        byCode.set(defn.code, existing);
        continue;
      }

      const parent = defn.parentCode ? byCode.get(defn.parentCode) : undefined;
      const now = new Date();

      const dept: Department = {
        id: 0,
        companyId,
        code: defn.code,
        name: defn.name,
        nameEnglish: defn.nameEnglish,
        departmentType: defn.departmentType,
        parentId: parent?.id,
        path: '',
        depth: parent ? parent.depth + 1 : 0,
        sortOrder: defn.sortOrder,
        managerUserId: undefined,
        managerTitle: defn.managerTitle,
        deputyManagerUserId: undefined,
        defaultSalaryAccount: undefined,
        defaultExpenseAccount: undefined,
        costAllocationMethod: undefined,
        hasBudgetControl: false,
        budgetAlertThreshold: 80,
        budgetControlLevel: BudgetControlLevel.None,
        status: DepartmentStatus.Active,
        effectiveDate: now.toISOString().split('T')[0],
        createdAt: now,
        createdByUserId,
      };

      this.deptRepo.save(dept);
      byCode.set(defn.code, dept);
      created.push(dept);
    }

    return created.length;
  }
}
