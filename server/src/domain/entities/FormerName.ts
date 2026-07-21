export interface FormerName {
  id: string;
  companyId: string;
  name: string;
  changedAt: string;
  changedByUserId?: string;
  reason?: string;
  createdAt: Date;
}

export function createFormerName(
  data: Omit<FormerName, 'id' | 'createdAt'> & { id?: string; createdAt?: Date },
): FormerName {
  return { id: crypto.randomUUID(), createdAt: new Date(), ...data };
}
