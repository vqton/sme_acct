export interface BusinessLine {
  id: number;
  companyId: number;
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
  data: Omit<BusinessLine, 'id' | 'createdAt'> & { id?: number; createdAt?: Date },
): BusinessLine {
  return {
    id: 0,
    createdAt: new Date(),
    ...data,
  };
}
