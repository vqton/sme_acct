export class UserNotFoundError extends Error {
  constructor(userId: number) {
    super(`User not found: ${userId}`);
    this.name = 'UserNotFoundError';
  }
}

export class UserGroupNotFoundError extends Error {
  constructor(groupId: number) {
    super(`User group not found: ${groupId}`);
    this.name = 'UserGroupNotFoundError';
  }
}

export class UserGroupNameTakenError extends Error {
  constructor(name: string) {
    super(`User group name already exists: ${name}`);
    this.name = 'UserGroupNameTakenError';
  }
}

export class UserAlreadyInGroupError extends Error {
  constructor(userId: number, groupId: number) {
    super(`User ${userId} is already in group ${groupId}`);
    this.name = 'UserAlreadyInGroupError';
  }
}

export class UserNotInGroupError extends Error {
  constructor(userId: number, groupId: number) {
    super(`User ${userId} is not in group ${groupId}`);
    this.name = 'UserNotInGroupError';
  }
}
