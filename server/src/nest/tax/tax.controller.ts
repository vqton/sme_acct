import {
  Controller, Get, Post, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus, Inject,
} from '@nestjs/common';
import { TaxDeclarationService } from '../../application/TaxDeclarationService.js';
import { TaxPeriodService } from '../../application/TaxPeriodService.js';
import { TaxCalendarService } from '../../application/TaxCalendarService.js';
import { LedgerTaxExtractionService } from '../../application/LedgerTaxExtractionService.js';
import { TaxAuditTrailService } from '../../application/TaxAuditTrailService.js';
import { AuthGuard } from '../common/guards/auth.guard.js';
import { PermissionGuard } from '../common/guards/permission.guard.js';
import { Permissions } from '../common/guards/permissions.decorator.js';
import { TenantGuard } from '../common/guards/tenant.guard.js';
import { TaxType, VatRate } from '../domain/enums/TaxEnums.js';

@Controller('tax')
@UseGuards(AuthGuard, PermissionGuard, TenantGuard)
export class TaxController {
  constructor(
    @Inject(TaxDeclarationService) private readonly declService: TaxDeclarationService,
    @Inject(TaxPeriodService) private readonly periodService: TaxPeriodService,
    @Inject(TaxCalendarService) private readonly calendarService: TaxCalendarService,
    @Inject(LedgerTaxExtractionService) private readonly extractionService: LedgerTaxExtractionService,
    @Inject(TaxAuditTrailService) private readonly auditTrailService: TaxAuditTrailService,
  ) {}

  // ─── Periods ────────────────────────────────────────────────

  @Post('periods')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('company:create')
  createPeriods(@Body() body: { companyId: number; year: number; type: string }) {
    return this.periodService.createPeriodsForYear(body.companyId, body.year, body.type);
  }

  @Get('periods')
  @Permissions('company:read')
  getPeriods(
    @Query('companyId') companyId: string,
    @Query('year') year: string,
  ) {
    return this.periodService.getPeriodsByYear(+companyId, +year);
  }

  @Get('periods/current')
  @Permissions('company:read')
  getCurrentPeriod(@Query('companyId') companyId: string) {
    return this.periodService.getCurrentOpenPeriod(+companyId);
  }

  @Post('periods/:id/lock')
  @Permissions('company:update')
  lockPeriod(@Param('id') id: string, @Body() body: { userId: number }) {
    return this.periodService.lockPeriod(+id, body.userId);
  }

  @Post('periods/:id/finalize')
  @Permissions('company:update')
  finalizePeriod(@Param('id') id: string, @Body() body: { userId: number }) {
    return this.periodService.finalizePeriod(+id, body.userId);
  }

  @Post('periods/:id/unlock')
  @Permissions('company:update')
  unlockPeriod(@Param('id') id: string, @Body() body: { userId: number; reason: string }) {
    return this.periodService.unlockPeriod(+id, body.userId, body.reason);
  }

  // ─── Declarations ──────────────────────────────────────────

  @Post('declarations')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('company:create')
  createDeclaration(@Body() body: { companyId: number; periodId: number; taxType: TaxType }) {
    return this.declService.createEmptyDeclaration(body);
  }

  @Get('declarations')
  @Permissions('company:read')
  listDeclarations(
    @Query('companyId') companyId: string,
    @Query('periodId') periodId?: string,
  ) {
    const cid = +companyId;
    if (periodId) return this.declService.getDeclarationsByPeriod(+periodId);
    return this.declService.getDeclarationsByCompany(cid);
  }

  @Get('declarations/:id')
  @Permissions('company:read')
  getDeclaration(@Param('id') id: string) {
    return this.declService.getDeclaration(+id);
  }

  @Post('declarations/vat')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('company:create')
  createVatDeclaration(
    @Query('companyId') companyId: string,
    @Body() body: { periodId: number; outputLines: Array<{ rate: VatRate; taxableAmount: number }>; inputLines: Array<{ rate: VatRate; taxableAmount: number }> },
  ) {
    return this.declService.createVatDeclaration(+companyId, body.periodId, {
      outputLines: body.outputLines,
      inputLines: body.inputLines,
    });
  }

  @Post('declarations/:id/submit')
  @HttpCode(HttpStatus.OK)
  @Permissions('company:update')
  submitDeclaration(@Param('id') id: string, @Body() body?: { userId?: number; comment?: string }) {
    const before = this.declService.getDeclaration(+id);
    const result = this.declService.submitDeclaration(+id);
    if (before) {
      this.auditTrailService.logChange({
        declarationId: +id,
        companyId: before.companyId,
        taxType: before.taxType,
        fromStatus: before.status,
        toStatus: result.status,
        changedByUserId: body?.userId ?? 0,
        comment: body?.comment,
      });
    }
    return result;
  }

  @Post('declarations/adjustment')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('company:create')
  createAdjustment(
    @Body() body: { originalId: number; outputLines: Array<{ rate: VatRate; taxableAmount: number }>; inputLines: Array<{ rate: VatRate; taxableAmount: number }> },
  ) {
    return this.declService.createAdjustmentDeclaration(body.originalId, body);
  }

  // ─── Calendar ──────────────────────────────────────────────

  @Get('calendar/:companyId/:year')
  @Permissions('company:read')
  getCalendar(
    @Param('companyId') companyId: string,
    @Param('year') year: string,
  ) {
    return this.calendarService.generateAllEvents(+companyId, +year);
  }

  @Get('calendar/:companyId/:year/upcoming')
  @Permissions('company:read')
  getUpcomingDeadlines(
    @Param('companyId') companyId: string,
    @Param('year') year: string,
    @Query('withinDays') withinDays = '15',
  ) {
    const all = this.calendarService.generateAllEvents(+companyId, +year);
    return this.calendarService.getUpcomingDeadlines(all, +withinDays);
  }

  // ─── Auto-fill from Ledger ─────────────────────────────────

  @Get('auto-fill/vat')
  @Permissions('company:read')
  autoFillVat(
    @Query('companyId') companyId: string,
    @Query('periodId') periodId: string,
  ) {
    return this.extractionService.extractVatForPeriod(+companyId, +periodId);
  }

  @Get('auto-fill/cit')
  @Permissions('company:read')
  autoFillCit(
    @Query('companyId') companyId: string,
    @Query('periodId') periodId: string,
  ) {
    return this.extractionService.extractCitForPeriod(+companyId, +periodId);
  }

  @Get('auto-fill/:taxType')
  @Permissions('company:read')
  autoFillTax(
    @Param('taxType') taxType: string,
    @Query('companyId') companyId: string,
    @Query('periodId') periodId: string,
  ) {
    return this.extractionService.extractTaxData(+companyId, +periodId, +taxType as TaxType);
  }

  // ─── Audit Trail ───────────────────────────────────────────

  @Get('audit/:declarationId')
  @Permissions('audit:view')
  getDeclarationAudit(@Param('declarationId') declarationId: string) {
    return this.auditTrailService.getHistory(+declarationId);
  }

  @Get('audit/company/:companyId')
  @Permissions('audit:view')
  getCompanyAudit(@Param('companyId') companyId: string) {
    return this.auditTrailService.getCompanyHistory(+companyId);
  }
}
