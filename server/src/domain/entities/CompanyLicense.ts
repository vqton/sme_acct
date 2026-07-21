export interface CompanyLicense {
  id: string;
  companyId: string;
  licenseType: number;
  licenseNumber: string;
  issuedBy: string;
  dateIssued: string;
  dateExpiry?: string;
  fileUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export function createCompanyLicense(
  data: Omit<CompanyLicense, 'id' | 'createdAt'> & { id?: string; createdAt?: Date },
): CompanyLicense {
  return { id: crypto.randomUUID(), createdAt: new Date(), ...data };
}
