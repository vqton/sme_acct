export interface Branch {
  id: number;
  companyId: number;
  branchType: number;
  name: string;
  address?: string;
  taxCode?: string;
  phone?: string;
  managerName?: string;
  status: number;
  dateOpened: string;
  dateClosed?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export function createBranch(
  data: Omit<Branch, 'id' | 'createdAt'> & { id?: number; createdAt?: Date },
): Branch {
  return { id: 0, createdAt: new Date(), ...data };
}
