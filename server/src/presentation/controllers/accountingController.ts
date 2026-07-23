import { Router, Response } from 'express';
import { AccountingService } from '../../application/AccountingService.js';
import { FinancialStatementService } from '../../application/FinancialStatementService.js';
import { PeriodCloseService } from '../../application/PeriodCloseService.js';
import { FxRevaluationService } from '../../application/FxRevaluationService.js';
import { RecurringEntryService } from '../../application/RecurringEntryService.js';
import { SQLiteAccountRepository } from '../../infrastructure/database/AccountRepository.js';
import { SQLiteJournalEntryRepository } from '../../infrastructure/database/JournalEntryRepository.js';
import { SQLiteLedgerRepository } from '../../infrastructure/database/LedgerRepository.js';
import { SQLiteFiscalPeriodRepository } from '../../infrastructure/database/FiscalPeriodRepository.js';
import { SQLiteAuditLogRepository } from '../../infrastructure/database/AuditLogRepository.js';
import { SQLiteCompanyRepository } from '../../infrastructure/database/CompanyRepository.js';
import { SQLiteRecurringTemplateRepository } from '../../infrastructure/database/RecurringTemplateRepository.js';
import { authMiddleware, requirePermission, AuthRequest } from '../middleware/auth.js';

const router = Router();

function createService() {
  return new AccountingService({
    accounts: new SQLiteAccountRepository(),
    journalEntries: new SQLiteJournalEntryRepository(),
    ledger: new SQLiteLedgerRepository(),
    fiscalPeriods: new SQLiteFiscalPeriodRepository(),
    auditLogs: new SQLiteAuditLogRepository(),
  });
}

function createFinancialStatementService() {
  return new FinancialStatementService(
    new SQLiteLedgerRepository(),
    new SQLiteFiscalPeriodRepository(),
    new SQLiteCompanyRepository(),
  );
}

function createPeriodCloseService() {
  return new PeriodCloseService(
    new SQLiteLedgerRepository(),
    new SQLiteFiscalPeriodRepository(),
    new SQLiteJournalEntryRepository(),
    new SQLiteAccountRepository(),
  );
}

function createFxRevaluationService() {
  return new FxRevaluationService(
    new SQLiteLedgerRepository(),
    new SQLiteAccountRepository(),
  );
}

function createRecurringEntryService() {
  return new RecurringEntryService(
    new SQLiteRecurringTemplateRepository(),
    new SQLiteJournalEntryRepository(),
    new SQLiteAccountRepository(),
  );
}

router.use(authMiddleware);

// ─── Chart of Accounts ──────────────────────────────────

router.get('/accounts', requirePermission('company:read'), (req: AuthRequest, res: Response) => {
  const companyId = req.query.companyId as string;
  if (!companyId) { res.status(400).json({ error: 'companyId required' }); return; }
  res.json(createService().listAccounts(+companyId));
});

router.get('/accounts/:id', requirePermission('company:read'), (req: AuthRequest, res: Response) => {
  try {
    res.json(createService().getAccount(+req.params.id));
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

router.post('/accounts', requirePermission('company:create'), (req: AuthRequest, res: Response) => {
  try {
    const acc = createService().createAccount(req.body);
    res.status(201).json(acc);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/accounts/:id', requirePermission('company:update'), (req: AuthRequest, res: Response) => {
  try {
    res.json(createService().updateAccount(+req.params.id, req.body));
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

router.delete('/accounts/:id', requirePermission('company:delete'), (req: AuthRequest, res: Response) => {
  try {
    createService().deleteAccount(+req.params.id);
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/accounts/seed', requirePermission('company:create'), (req: AuthRequest, res: Response) => {
  try {
    const accounts = createService().seedStandardAccounts(req.body.companyId);
    res.status(201).json(accounts);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ─── Journal Entries ────────────────────────────────────

router.get('/journal-entries', requirePermission('company:read'), (req: AuthRequest, res: Response) => {
  const companyId = req.query.companyId as string;
  if (!companyId) { res.status(400).json({ error: 'companyId required' }); return; }
  res.json(createService().listJournalEntries(+companyId));
});

router.get('/journal-entries/:id', requirePermission('company:read'), (req: AuthRequest, res: Response) => {
  try {
    res.json(createService().getJournalEntry(+req.params.id));
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

router.post('/journal-entries', requirePermission('company:create'), (req: AuthRequest, res: Response) => {
  try {
    const entry = createService().createJournalEntry(req.body);
    res.status(201).json(entry);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/journal-entries/:id/post', requirePermission('transaction:approve'), (req: AuthRequest, res: Response) => {
  try {
    const entry = createService().postJournalEntry(+req.params.id, req.user!.userId);
    res.json(entry);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/journal-entries/:id/reverse', requirePermission('transaction:approve'), (req: AuthRequest, res: Response) => {
  try {
    const result = createService().reverseJournalEntry(+req.params.id, req.user!.userId);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/journal-entries/:id', requirePermission('company:delete'), (req: AuthRequest, res: Response) => {
  try {
    createService().deleteJournalEntry(+req.params.id);
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ─── Ledger ──────────────────────────────────────────────

router.get('/ledger', requirePermission('report:read'), (req: AuthRequest, res: Response) => {
  const { companyId, accountId, periodId } = req.query as Record<string, string | undefined>;
  if (!companyId) { res.status(400).json({ error: 'companyId required' }); return; }
  res.json(createService().getLedgerEntries(+companyId, accountId ? +accountId : undefined, periodId ? +periodId : undefined));
});

router.get('/ledger/balances', requirePermission('report:read'), (req: AuthRequest, res: Response) => {
  const { companyId, periodId } = req.query as Record<string, string | undefined>;
  if (!companyId || !periodId) { res.status(400).json({ error: 'companyId and periodId required' }); return; }
  res.json(createService().getTrialBalance(+companyId, +periodId));
});

router.get('/ledger/balances/:accountId', requirePermission('report:read'), (req: AuthRequest, res: Response) => {
  const { companyId, periodId } = req.query as Record<string, string | undefined>;
  if (!companyId || !periodId) { res.status(400).json({ error: 'companyId and periodId required' }); return; }
  const bal = createService().getAccountBalance(+companyId, +req.params.accountId, +periodId);
  if (!bal) { res.status(404).json({ error: 'Balance not found' }); return; }
  res.json(bal);
});

// ─── Fiscal Periods ─────────────────────────────────────

router.get('/fiscal-periods', requirePermission('company:read'), (req: AuthRequest, res: Response) => {
  const companyId = req.query.companyId as string;
  if (!companyId) { res.status(400).json({ error: 'companyId required' }); return; }
  res.json(createService().getFiscalPeriods(+companyId));
});

router.get('/fiscal-periods/current', requirePermission('company:read'), (req: AuthRequest, res: Response) => {
  const companyId = req.query.companyId as string;
  if (!companyId) { res.status(400).json({ error: 'companyId required' }); return; }
  const period = createService().getCurrentPeriod(+companyId);
  if (!period) { res.status(404).json({ error: 'No open period' }); return; }
  res.json(period);
});

router.post('/fiscal-periods', requirePermission('settings:manage'), (req: AuthRequest, res: Response) => {
  try {
    const period = createService().openNewPeriod(req.body.companyId, req.body.year, req.body.month);
    res.status(201).json(period);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/fiscal-periods/:id/close', requirePermission('settings:manage'), (req: AuthRequest, res: Response) => {
  try {
    const period = createService().closeFiscalPeriod(+req.params.id, req.user!.userId);
    res.json(period);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ─── Financial Statements ─────────────────────────────

router.get('/financial-statements/balance-sheet', requirePermission('report:read'), (req: AuthRequest, res: Response) => {
  const { companyId, periodId } = req.query as Record<string, string | undefined>;
  if (!companyId || !periodId) { res.status(400).json({ error: 'companyId and periodId required' }); return; }
  try {
    res.json(createFinancialStatementService().generateBalanceSheet(+companyId, +periodId));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/financial-statements/income-statement', requirePermission('report:read'), (req: AuthRequest, res: Response) => {
  const { companyId, periodId } = req.query as Record<string, string | undefined>;
  if (!companyId || !periodId) { res.status(400).json({ error: 'companyId and periodId required' }); return; }
  try {
    res.json(createFinancialStatementService().generateIncomeStatement(+companyId, +periodId));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ─── Period Close (enhanced) ──────────────────────────

router.get('/period-close/:periodId/validate', requirePermission('settings:manage'), (req: AuthRequest, res: Response) => {
  const companyId = req.query.companyId as string;
  if (!companyId) { res.status(400).json({ error: 'companyId required' }); return; }
  try {
    res.json(createPeriodCloseService().validateClose(+companyId, +req.params.periodId));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/period-close/:periodId/close', requirePermission('settings:manage'), (req: AuthRequest, res: Response) => {
  const { companyId, carryForwardToPeriodId, transferNetIncome } = req.body;
  if (!companyId) { res.status(400).json({ error: 'companyId required' }); return; }
  try {
    const result = createPeriodCloseService().closeWithValidation(
      companyId, +req.params.periodId, req.user!.userId,
      {
        skipValidation: req.body.skipValidation,
        carryForwardToPeriodId: carryForwardToPeriodId ? +carryForwardToPeriodId : undefined,
        transferNetIncome,
      },
    );
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/period-close/carry-forward', requirePermission('settings:manage'), (req: AuthRequest, res: Response) => {
  const { companyId, fromPeriodId, toPeriodId } = req.body;
  if (!companyId || !fromPeriodId || !toPeriodId) {
    res.status(400).json({ error: 'companyId, fromPeriodId, toPeriodId required' }); return;
  }
  try {
    res.json(createPeriodCloseService().carryForwardBalances(companyId, fromPeriodId, toPeriodId));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ─── FX Revaluation ───────────────────────────────────

router.get('/fx-revaluation/accounts', requirePermission('report:read'), (req: AuthRequest, res: Response) => {
  const companyId = req.query.companyId as string;
  if (!companyId) { res.status(400).json({ error: 'companyId required' }); return; }
  res.json(createFxRevaluationService().getForeignCurrencyAccounts(+companyId));
});

router.post('/fx-revaluation/preview', requirePermission('report:read'), (req: AuthRequest, res: Response) => {
  const { companyId, periodId, currentRates, bookingRates } = req.body;
  if (!companyId || !periodId || !currentRates) {
    res.status(400).json({ error: 'companyId, periodId, currentRates required' }); return;
  }
  try {
    res.json(createFxRevaluationService().previewRevaluation(companyId, periodId, currentRates, bookingRates));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ─── Recurring Entries ───────────────────────────────

router.get('/recurring-templates', requirePermission('company:read'), (req: AuthRequest, res: Response) => {
  const companyId = req.query.companyId as string;
  if (!companyId) { res.status(400).json({ error: 'companyId required' }); return; }
  res.json(createRecurringEntryService().listTemplates(+companyId));
});

router.get('/recurring-templates/:id', requirePermission('company:read'), (req: AuthRequest, res: Response) => {
  try {
    res.json(createRecurringEntryService().getTemplate(+req.params.id));
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

router.post('/recurring-templates', requirePermission('company:create'), (req: AuthRequest, res: Response) => {
  try {
    const tpl = createRecurringEntryService().createTemplate(req.body);
    res.status(201).json(tpl);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/recurring-templates/:id/generate', requirePermission('company:create'), (req: AuthRequest, res: Response) => {
  const { periodId, params } = req.body;
  if (!periodId) { res.status(400).json({ error: 'periodId required' }); return; }
  try {
    const entry = createRecurringEntryService().generateEntry(+req.params.id, periodId, params ?? {});
    res.status(201).json(entry);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/recurring-templates/process-due', requirePermission('company:create'), (req: AuthRequest, res: Response) => {
  const { asOfDate, periodId } = req.body;
  if (!asOfDate || !periodId) { res.status(400).json({ error: 'asOfDate and periodId required' }); return; }
  try {
    const results = createRecurringEntryService().processDueEntries(asOfDate, periodId);
    res.json(results);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
