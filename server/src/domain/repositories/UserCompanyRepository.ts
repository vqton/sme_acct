import { UserCompany } from '../entities/UserCompany';

export interface UserCompanyRepository {
  findByUserId(userId: string): UserCompany[];
  findByUserIdAndCompanyId(userId: string, companyId: string): UserCompany | null;
  create(userCompany: UserCompany): void;
}
