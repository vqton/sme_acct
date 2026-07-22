import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Req, UseGuards, HttpCode, HttpStatus, Inject,
} from '@nestjs/common';
import { Request } from 'express';
import { DepartmentUseCases } from '../../application/DepartmentUseCases.js';
import { AuthGuard, AuthenticatedRequest } from '../common/guards/auth.guard.js';
import { PermissionGuard } from '../common/guards/permission.guard.js';
import { Permissions } from '../common/guards/permissions.decorator.js';
import { TenantGuard } from '../common/guards/tenant.guard.js';
import type { CreateDepartmentInput } from '../../domain/entities/Department.js';
import { DepartmentType, DepartmentStatus } from '../../domain/enums/DepartmentEnums.js';

@Controller('companies/:companyId/departments')
@UseGuards(AuthGuard, PermissionGuard, TenantGuard)
export class DepartmentController {
  constructor(@Inject(DepartmentUseCases) private readonly useCases: DepartmentUseCases) {}

  @Get()
  @Permissions('department:read')
  list(@Param('companyId') companyId: string) {
    return this.useCases.list(companyId);
  }

  @Get('tree')
  @Permissions('department:read')
  getTree(@Param('companyId') companyId: string) {
    return this.useCases.getTree(companyId);
  }

  @Get(':id')
  @Permissions('department:read')
  getById(@Param('id') id: string) {
    return this.useCases.getById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions('department:create')
  create(@Param('companyId') companyId: string, @Body() body: Record<string, unknown>) {
    return this.useCases.create({
      companyId,
      code: body.code as string,
      name: body.name as string,
      nameEnglish: body.nameEnglish as string | undefined,
      departmentType: body.departmentType as DepartmentType | undefined,
      parentId: body.parentId as string | undefined,
      sortOrder: body.sortOrder as number | undefined,
      managerUserId: body.managerUserId as string | undefined,
      managerTitle: body.managerTitle as string | undefined,
      deputyManagerUserId: body.deputyManagerUserId as string | undefined,
      defaultSalaryAccount: body.defaultSalaryAccount as string | undefined,
      defaultExpenseAccount: body.defaultExpenseAccount as string | undefined,
      hasBudgetControl: body.hasBudgetControl as boolean | undefined,
      budgetAlertThreshold: body.budgetAlertThreshold as number | undefined,
      budgetControlLevel: body.budgetControlLevel as number | undefined,
      effectiveDate: body.effectiveDate as string | undefined,
    });
  }

  @Put(':id')
  @Permissions('department:update')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.useCases.update(id, body);
  }

  @Patch(':id/reparent')
  @Permissions('department:update')
  reparent(@Param('id') id: string, @Body() body: { newParentId: string }) {
    return this.useCases.reparent(id, body.newParentId);
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @Permissions('department:update')
  deactivate(@Param('id') id: string) {
    return this.useCases.deactivate(id);
  }

  @Post(':id/reactivate')
  @HttpCode(HttpStatus.OK)
  @Permissions('department:update')
  reactivate(@Param('id') id: string) {
    return this.useCases.reactivate(id);
  }

  @Post(':id/dissolve')
  @HttpCode(HttpStatus.OK)
  @Permissions('department:update')
  dissolve(@Param('id') id: string, @Body() body: { dissolutionDate?: string }) {
    return this.useCases.dissolve(id, body.dissolutionDate);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions('department:delete')
  delete(@Param('id') id: string): void {
    this.useCases.delete(id);
  }

  // ─── User-Department Assignment ───────────────────────

  @Get(':deptId/users')
  @Permissions('department:read')
  getDepartmentUsers(@Param('deptId') deptId: string) {
    return this.useCases.getDepartmentUsers(deptId);
  }

  @Post(':deptId/users')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('department:create')
  assignUser(@Param('companyId') companyId: string, @Param('deptId') deptId: string, @Body() body: Record<string, unknown>) {
    return this.useCases.assignUser({
      userId: body.userId as string,
      departmentId: deptId,
      isPrimary: (body.isPrimary as boolean) ?? false,
      jobTitle: body.jobTitle as string | undefined,
    });
  }

  @Post(':deptId/users/:userId/primary')
  @HttpCode(HttpStatus.OK)
  @Permissions('department:update')
  changePrimary(@Param('deptId') deptId: string, @Param('userId') userId: string) {
    this.useCases.changePrimaryDepartment(userId, deptId);
    return { ok: true };
  }

  @Delete(':deptId/users/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions('department:update')
  removeUser(@Param('deptId') deptId: string, @Param('userId') userId: string): void {
    this.useCases.removeUserFromDepartment(userId, deptId);
  }
}
