import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus, Inject,
} from '@nestjs/common';
import { AccountingService } from '../../application/AccountingService.js';
import { AuthGuard } from '../common/guards/auth.guard.js';
import { PermissionGuard } from '../common/guards/permission.guard.js';
import { Permissions } from '../common/guards/permissions.decorator.js';
import { TenantGuard } from '../common/guards/tenant.guard.js';

@Controller('accounts')
@UseGuards(AuthGuard, PermissionGuard, TenantGuard)
export class AccountingController {
  constructor(@Inject(AccountingService) private readonly accountingService: AccountingService) {}

  @Get()
  @Permissions('company:read')
  listAccounts() {
    return this.accountingService.listAccounts(1);
  }

  @Get(':id')
  @Permissions('company:read')
  getAccount(@Param('id') id: string) {
    return this.accountingService.getAccount(+id);
  }

  @Get('by-number/:number')
  @Permissions('company:read')
  getByNumber(@Param('number') number: string, @Query('companyId') companyId: string) {
    return this.accountingService.getAccountByNumber(+companyId, number);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions('company:create')
  createAccount(@Body() body: Record<string, unknown>) {
    return this.accountingService.createAccount(body as any);
  }

  @Put(':id')
  @Permissions('company:update')
  updateAccount(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.accountingService.updateAccount(+id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions('company:delete')
  deleteAccount(@Param('id') id: string): void {
    this.accountingService.deleteAccount(+id);
  }

  @Post('seed')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('company:create')
  seedAccounts(@Body() body: { companyId: number; regime?: number }) {
    return this.accountingService.seedStandardAccounts(body.companyId, body.regime as any);
  }

  @Get(':companyId/audit-logs')
  @Permissions('audit:view')
  getAuditLogs(@Param('companyId') companyId: string) {
    return this.accountingService.getAuditLogs(+companyId);
  }
}
