import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus, Inject,
} from '@nestjs/common';
import { UserManagementService } from '../../application/UserManagementService.js';
import { UserGroupService } from '../../application/UserGroupService.js';
import { AuthGuard } from '../common/guards/auth.guard.js';
import { PermissionGuard } from '../common/guards/permission.guard.js';
import { Permissions } from '../common/guards/permissions.decorator.js';

@Controller('users')
@UseGuards(AuthGuard, PermissionGuard)
export class UserController {
  constructor(
    @Inject(UserManagementService) private readonly userService: UserManagementService,
    @Inject(UserGroupService) private readonly groupService: UserGroupService,
  ) {}

  @Get()
  @Permissions('user:read')
  list(
    @Query('query') query?: string,
    @Query('isActive') isActive?: string,
    @Query('role') role?: string,
    @Query('groupId') groupId?: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
  ) {
    const users = this.userService.listUsers({
      query,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      role,
      groupId,
      offset: offset ? parseInt(offset, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    const total = this.userService.countUsers({
      query,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      role,
      groupId,
    });
    return { data: users, total };
  }

  @Get(':id')
  @Permissions('user:read')
  getById(@Param('id') id: string) {
    const user = this.userService.getUser(id);
    if (!user) throw new Error('User not found');
    return user;
  }

  @Put(':id')
  @Permissions('user:update')
  update(@Param('id') id: string, @Body() body: any) {
    return this.userService.updateUser(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions('user:delete')
  delete(@Param('id') id: string): void {
    this.userService.deleteUser(id);
  }

  @Post(':id/activate')
  @Permissions('user:update')
  activate(@Param('id') id: string) {
    return this.userService.activateUser(id);
  }

  @Post(':id/deactivate')
  @Permissions('user:update')
  deactivate(@Param('id') id: string) {
    return this.userService.deactivateUser(id);
  }

  @Get(':id/roles')
  @Permissions('user:read')
  getRoles(@Param('id') id: string) {
    return { roles: this.userService.getUserRoles(id) };
  }

  @Post(':id/roles')
  @Permissions('user:update')
  assignRole(@Param('id') id: string, @Body() body: { role: string }) {
    this.userService.assignRole(id, body.role);
    return { roles: this.userService.getUserRoles(id) };
  }

  @Delete(':id/roles/:role')
  @Permissions('user:update')
  removeRole(@Param('id') id: string, @Param('role') role: string) {
    this.userService.removeRole(id, role);
    return { roles: this.userService.getUserRoles(id) };
  }

  @Get(':id/groups')
  @Permissions('user:read')
  getGroups(@Param('id') id: string) {
    return { data: this.userService.getUserGroups(id) };
  }

  @Post(':id/groups/:groupId')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('user:update')
  addToGroup(@Param('id') id: string, @Param('groupId') groupId: string) {
    this.userService.addUserToGroup(id, groupId);
    return { ok: true };
  }

  @Delete(':id/groups/:groupId')
  @Permissions('user:update')
  removeFromGroup(@Param('id') id: string, @Param('groupId') groupId: string) {
    this.userService.removeUserFromGroup(id, groupId);
    return { ok: true };
  }

  // ─── Group Management ───────────────────────────────────

  @Get('groups/all')
  @Permissions('user:read')
  listGroups() {
    return { data: this.groupService.listGroups() };
  }

  @Post('groups')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('user:create')
  createGroup(@Body() body: any) {
    return this.groupService.createGroup(body);
  }

  @Put('groups/:id')
  @Permissions('user:update')
  updateGroup(@Param('id') id: string, @Body() body: any) {
    return this.groupService.updateGroup(id, body);
  }

  @Delete('groups/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions('user:delete')
  deleteGroup(@Param('id') id: string): void {
    this.groupService.deleteGroup(id);
  }

  @Post('groups/:id/toggle')
  @Permissions('user:update')
  toggleGroup(@Param('id') id: string, @Body() body: { isActive: boolean }) {
    return this.groupService.toggleGroupActive(id, body.isActive);
  }
}
