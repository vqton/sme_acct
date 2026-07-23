export interface FormerName {
  id: number;
  companyId: number;
  name: string;
  changedAt: string;
  changedByUserId?: number;
  reason?: string;
  createdAt: Date;
}

export function createFormerName(
  data: Omit<FormerName, 'id' | 'createdAt'> & { id?: number; createdAt?: Date },
): FormerName {
  return { id: 0, createdAt: new Date(), ...data };
}
