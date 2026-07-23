export interface UserDepartment {
  userId: number;
  departmentId: number;
  isPrimary: boolean;
  jobTitle?: string;
  isActive: boolean;
  assignedAt: Date;
}

export type CreateUserDepartmentInput = {
  userId: number;
  departmentId: number;
  isPrimary?: boolean;
  jobTitle?: string;
};

export function createUserDepartment(data: CreateUserDepartmentInput): UserDepartment {
  return {
    userId: data.userId,
    departmentId: data.departmentId,
    isPrimary: data.isPrimary ?? false,
    isActive: true,
    assignedAt: new Date(),
    jobTitle: data.jobTitle,
  };
}
