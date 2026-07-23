export interface CompanySeal {
  id: number;
  companyId: number;
  sealRegistrationNumber?: string;
  sealImageUrl?: string;
  issuedBy?: string;
  dateRegistered?: string;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export function createCompanySeal(
  data: Omit<CompanySeal, 'id' | 'createdAt'> & { id?: number; createdAt?: Date },
): CompanySeal {
  return { id: 0, createdAt: new Date(), ...data };
}
