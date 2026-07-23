export interface CompanyLicense {
  id: number;
  companyId: number;
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
  data: Omit<CompanyLicense, 'id' | 'createdAt'> & { id?: number; createdAt?: Date },
): CompanyLicense {
  return { id: 0, createdAt: new Date(), ...data };
}
