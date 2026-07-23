import { describe, it, expect } from 'vitest';
import { createUserDepartment } from './UserDepartment.js';

describe('UserDepartment', () => {
  it('creates with required fields', () => {
    const ud = createUserDepartment({ userId: 1, departmentId: 1 });
    expect(ud.userId).toBe(1);
    expect(ud.departmentId).toBe(1);
    expect(ud.isPrimary).toBe(false);
    expect(ud.isActive).toBe(true);
    expect(ud.assignedAt).toBeInstanceOf(Date);
  });

  it('creates with primary flag and job title', () => {
    const ud = createUserDepartment({ userId: 1, departmentId: 1, isPrimary: true, jobTitle: 'Kế toán trưởng' });
    expect(ud.isPrimary).toBe(true);
    expect(ud.jobTitle).toBe('Kế toán trưởng');
  });
});
