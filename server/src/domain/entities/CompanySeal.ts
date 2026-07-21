export interface CompanySeal {
  id: string;
  companyId: string;
  sealRegistrationNumber?: string;
  sealImageUrl?: string;
  issuedBy?: string;
  dateRegistered?: string;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export function createCompanySeal(
  data: Omit<CompanySeal, 'id' | 'createdAt'> & { id?: string; createdAt?: Date },
): CompanySeal {
  return { id: crypto.randomUUID(), createdAt: new Date(), ...data };
}
