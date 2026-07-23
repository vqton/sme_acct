export interface CapitalContributor {
  id: number;
  companyId: number;
  contributorType: number;
  fullName: string;
  idNumber?: string;
  contributorCategory: number;
  capitalContribution: number;
  ownershipRatio: number;
  contributionDate: string;
  contributionCertificate?: string;
  isFounder: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export function createCapitalContributor(
  data: Omit<CapitalContributor, 'id' | 'createdAt'> & { id?: number; createdAt?: Date },
): CapitalContributor {
  return {
    id: 0,
    createdAt: new Date(),
    ...data,
  };
}

export function validateOwnershipRatio(contributors: CapitalContributor[]): { valid: boolean; total: number } {
  const total = contributors.reduce((sum, c) => sum + c.ownershipRatio, 0);
  return { valid: Math.abs(total - 100) < 0.01, total };
}
