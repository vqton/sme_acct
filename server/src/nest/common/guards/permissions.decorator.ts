import { SetMetadata } from '@nestjs/common';
import { type Permission } from '../../../domain/entities/Role.js';
import { PERMISSIONS_KEY } from './permission.guard.js';

export const Permissions = (...permissions: Permission[]) => SetMetadata(PERMISSIONS_KEY, permissions);
