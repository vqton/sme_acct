export interface UserCompany {
  userId: number;
  companyId: number;
  role?: string;
  isActive: boolean;
  joinedAt: Date;
}
