export interface Branch {
  id: string;
  companyId: string;
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
  data: Omit<Branch, 'id' | 'createdAt'> & { id?: string; createdAt?: Date },
): Branch {
  return { id: crypto.randomUUID(), createdAt: new Date(), ...data };
}
