import {
  Controller, Get, Post, Put, Delete, Body, Param, Req,
  UseGuards, HttpCode, HttpStatus, Inject,
} from '@nestjs/common';
import { Request } from 'express';
import { CompanyUseCases } from '../../application/CompanyUseCases.js';
import { AuthGuard } from '../common/guards/auth.guard.js';
import { PermissionGuard } from '../common/guards/permission.guard.js';
import { Permissions } from '../common/guards/permissions.decorator.js';
import { TenantGuard } from '../common/guards/tenant.guard.js';

@Controller('companies')
@UseGuards(AuthGuard, PermissionGuard, TenantGuard)
export class CompanyController {
  constructor(@Inject(CompanyUseCases) private readonly companyUseCases: CompanyUseCases) {}

  @Get()
  @Permissions('company:read')
  list() {
    return this.companyUseCases.list();
  }

  @Get(':id')
  @Permissions('company:read')
  getById(@Param('id') id: string) {
    return this.companyUseCases.getById(+id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions('company:create')
  create(@Body() body: Record<string, unknown>) {
    return this.companyUseCases.create(body);
  }

  @Put(':id')
  @Permissions('company:update')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.companyUseCases.update(+id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions('company:delete')
  delete(@Param('id') id: string): void {
    this.companyUseCases.delete(+id);
  }

  // ─── Status Lifecycle ─────────────────────────────────

  @Post(':id/activate')
  @Permissions('company:update')
  activate(@Param('id') id: string) {
    return this.companyUseCases.activate(+id);
  }

  @Post(':id/suspend')
  @Permissions('company:update')
  suspend(@Param('id') id: string) {
    return this.companyUseCases.suspend(+id);
  }

  @Post(':id/dissolve')
  @Permissions('company:update')
  dissolve(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.companyUseCases.dissolve(+id, body.reason);
  }

  @Post(':id/bankrupt')
  @Permissions('company:update')
  bankrupt(@Param('id') id: string) {
    return this.companyUseCases.bankrupt(+id);
  }

  @Post(':id/convert')
  @Permissions('company:update')
  convert(@Param('id') id: string) {
    return this.companyUseCases.convert(+id);
  }

  @Post(':id/merge')
  @Permissions('company:update')
  merge(@Param('id') id: string) {
    return this.companyUseCases.merge(+id);
  }

  // ─── Legal Representatives ─────────────────────────────

  @Get(':id/legal-reps')
  @Permissions('company:read')
  getLegalReps(@Param('id') id: string) {
    return this.companyUseCases.getLegalReps(+id);
  }

  @Post(':id/legal-reps')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('company:create')
  addLegalRep(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.companyUseCases.addLegalRep(+id, body);
  }

  @Put(':companyId/legal-reps/:repId')
  @Permissions('company:update')
  updateLegalRep(@Param('companyId') companyId: string, @Param('repId') repId: string, @Body() body: Record<string, unknown>) {
    const result = this.companyUseCases.updateLegalRep(+repId, body);
    if (!result) throw new Error('Legal representative not found');
    return result;
  }

  @Delete(':companyId/legal-reps/:repId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions('company:update')
  deleteLegalRep(@Param('companyId') companyId: string, @Param('repId') repId: string): void {
    this.companyUseCases.deleteLegalRep(+repId);
  }

  // ─── Capital Contributors ────────────────────────────

  @Get(':id/contributors')
  @Permissions('company:read')
  getContributors(@Param('id') id: string) {
    return this.companyUseCases.getCapitalContributors(+id);
  }

  @Post(':id/contributors')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('company:create')
  addContributor(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.companyUseCases.addCapitalContributor(+id, body);
  }

  // ─── Business Lines ─────────────────────────────────

  @Get(':id/business-lines')
  @Permissions('company:read')
  getBusinessLines(@Param('id') id: string) {
    return this.companyUseCases.getBusinessLines(+id);
  }

  @Post(':id/business-lines')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('company:create')
  addBusinessLine(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.companyUseCases.addBusinessLine(+id, body);
  }

  // ─── Bank Accounts ──────────────────────────────────

  @Get(':id/bank-accounts')
  @Permissions('company:read')
  getBankAccounts(@Param('id') id: string) {
    return this.companyUseCases.getBankAccounts(+id);
  }

  @Post(':id/bank-accounts')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('company:create')
  addBankAccount(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.companyUseCases.addBankAccount(+id, body);
  }
}
