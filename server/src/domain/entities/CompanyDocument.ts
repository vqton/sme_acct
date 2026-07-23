export interface CompanyDocument {
  id: number;
  companyId: number;
  documentType: number;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  contentType?: string;
  expiryDate?: string;
  uploadedAt: string;
  createdAt: Date;
}

export function createCompanyDocument(
  data: Omit<CompanyDocument, 'id' | 'createdAt'> & { id?: number; createdAt?: Date },
): CompanyDocument {
  return { id: 0, createdAt: new Date(), ...data };
}
