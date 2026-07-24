import {
  Controller, Get, Post, Delete, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus, Inject,
} from '@nestjs/common';
import { OpeningBalanceService } from '../../application/OpeningBalanceService.js';
import { OpeningBalanceImportSource } from '../../domain/enums/OpeningBalanceEnums.js';
import { AuthGuard } from '../common/guards/auth.guard.js';
import { PermissionGuard } from '../common/guards/permission.guard.js';
import { Permissions } from '../common/guards/permissions.decorator.js';
import { TenantGuard } from '../common/guards/tenant.guard.js';

@Controller('opening-balance')
@UseGuards(AuthGuard, PermissionGuard, TenantGuard)
export class OpeningBalanceController {
  constructor(
    @Inject(OpeningBalanceService)
    private readonly obService: OpeningBalanceService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions('company:create')
  create(
    @Body() body: {
      companyId: number;
      periodId: number;
      entryDate: string;
      userId: number;
      lines: Array<{
        accountId: number;
        accountNumber: string;
        accountName: string;
        debitAmount?: number;
        creditAmount?: number;
        foreignCurrencyCode?: string;
        foreignDebitAmount?: number;
        foreignCreditAmount?: number;
        exchangeRate?: number;
        bankAccountId?: number;
        customerId?: number;
        supplierId?: number;
        employeeId?: number;
        inventoryItemId?: number;
        fixedAssetId?: number;
        toolId?: number;
        prepaidExpenseId?: number;
      }>;
      description?: string;
      importSource?: OpeningBalanceImportSource;
    },
  ) {
    return this.obService.createOpeningBalance(
      body.companyId,
      body.periodId,
      body.entryDate,
      body.userId,
      body.lines,
      { description: body.description, importSource: body.importSource },
    );
  }

  @Get('company/:companyId')
  @Permissions('company:read')
  listByCompany(@Param('companyId') companyId: string) {
    return this.obService.listByCompany(+companyId);
  }

  @Get('company/:companyId/period/:periodId')
  @Permissions('company:read')
  listByPeriod(
    @Param('companyId') companyId: string,
    @Param('periodId') periodId: string,
  ) {
    return this.obService.listByPeriod(+companyId, +periodId);
  }

  @Get(':id')
  @Permissions('company:read')
  getDetail(@Param('id') id: string) {
    return this.obService.getOpeningBalanceDetail(+id);
  }

  @Post(':id/lock')
  @Permissions('company:update')
  lock(@Param('id') id: string, @Body() body: { userId: number }) {
    return this.obService.lockOpeningBalance(+id, body.userId);
  }

  @Post(':id/unlock')
  @Permissions('company:update')
  unlock(@Param('id') id: string, @Body() body: { userId: number; reason?: string }) {
    return this.obService.unlockOpeningBalance(+id, body.userId, body.reason);
  }

  @Post(':id/submit')
  @Permissions('company:update')
  submit(@Param('id') id: string) {
    return this.obService.submitForApproval(+id);
  }

  @Post(':id/approve')
  @Permissions('transaction:approve')
  approve(@Param('id') id: string, @Body() body: { userId: number }) {
    return this.obService.approveOpeningBalance(+id, body.userId);
  }

  @Post(':id/reject')
  @Permissions('transaction:approve')
  reject(@Param('id') id: string, @Body() body: { userId: number; reason: string }) {
    return this.obService.rejectApproval(+id, body.userId, body.reason);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions('company:delete')
  delete(@Param('id') id: string): void {
    this.obService.deleteOpeningBalance(+id);
  }
}
