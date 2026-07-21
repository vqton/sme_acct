export interface BusinessLine {
  id: string;
  companyId: string;
  vsicCode: string;
  vsicLevel: number;
  name: string;
  isPrimary: boolean;
  startDate: string;
  endDate?: string;
  licenseReference?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export function createBusinessLine(
  data: Omit<BusinessLine, 'id' | 'createdAt'> & { id?: string; createdAt?: Date },
): BusinessLine {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date(),
    ...data,
  };
}
