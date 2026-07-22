export class DuplicateDepartmentCodeError extends Error {
  constructor(code: string) {
    super(`Department code already exists: ${code}`);
    this.name = 'DuplicateDepartmentCodeError';
  }
}

export class DepartmentNotFoundError extends Error {
  constructor(id: string) {
    super(`Department not found: ${id}`);
    this.name = 'DepartmentNotFoundError';
  }
}

export class DepartmentHasChildrenError extends Error {
  constructor(id: string) {
    super(`Department has children: ${id}`);
    this.name = 'DepartmentHasChildrenError';
  }
}

export class DepartmentHasMembersError extends Error {
  constructor(id: string) {
    super(`Department has assigned users: ${id}`);
    this.name = 'DepartmentHasMembersError';
  }
}

export class DepartmentCircularReferenceError extends Error {
  constructor() {
    super('Cannot reparent to its own descendant');
    this.name = 'DepartmentCircularReferenceError';
  }
}
