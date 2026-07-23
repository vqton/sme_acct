import { UserCompany } from '../entities/UserCompany';

export interface UserCompanyRepository {
  findByUserId(userId: number): UserCompany[];
  findByUserIdAndCompanyId(userId: number, companyId: number): UserCompany | null;
  create(userCompany: UserCompany): void;
}
