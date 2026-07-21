export interface CompanyDocument {
  id: string;
  companyId: string;
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
  data: Omit<CompanyDocument, 'id' | 'createdAt'> & { id?: string; createdAt?: Date },
): CompanyDocument {
  return { id: crypto.randomUUID(), createdAt: new Date(), ...data };
}
