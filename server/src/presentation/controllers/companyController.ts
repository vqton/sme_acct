import { Router, Response } from 'express';
import { CompanyUseCases } from '../../application/CompanyUseCases.js';
import { SQLiteCompanyRepository } from '../../infrastructure/database/CompanyRepository.js';
import { SQLLegalRepresentativeRepository } from '../../infrastructure/database/LegalRepresentativeRepository.js';
import { SQLiteCapitalContributorRepository } from '../../infrastructure/database/CapitalContributorRepository.js';
import { SQLiteBusinessLineRepository } from '../../infrastructure/database/BusinessLineRepository.js';
import { SQLiteCompanyBankAccountRepository } from '../../infrastructure/database/CompanyBankAccountRepository.js';
import { authMiddleware, requirePermission, AuthRequest } from '../middleware/auth.js';

const router = Router();

function createUseCases() {
  return new CompanyUseCases({
    company: new SQLiteCompanyRepository(),
    legalReps: new SQLLegalRepresentativeRepository(),
    capitalContributors: new SQLiteCapitalContributorRepository(),
    businessLines: new SQLiteBusinessLineRepository(),
    bankAccounts: new SQLiteCompanyBankAccountRepository(),
  });
}

router.use(authMiddleware);

// ─── Company CRUD ────────────────────────────────────────

router.get('/', requirePermission('company:read'), (_req: AuthRequest, res: Response) => {
  res.json(createUseCases().list());
});

router.get('/:id', requirePermission('company:read'), (req: AuthRequest, res: Response) => {
  res.json(createUseCases().getById(req.params.id));
});

router.post('/', requirePermission('company:create'), (req: AuthRequest, res: Response) => {
  const company = createUseCases().create(req.body);
  res.status(201).json(company);
});

router.put('/:id', requirePermission('company:update'), (req: AuthRequest, res: Response) => {
  res.json(createUseCases().update(req.params.id, req.body));
});

router.delete('/:id', requirePermission('company:delete'), (req: AuthRequest, res: Response) => {
  createUseCases().delete(req.params.id);
  res.status(204).send();
});

// ─── Status Lifecycle ────────────────────────────────────

router.post('/:id/activate', requirePermission('company:update'), (req: AuthRequest, res: Response) => {
  res.json(createUseCases().activate(req.params.id));
});

router.post('/:id/suspend', requirePermission('company:update'), (req: AuthRequest, res: Response) => {
  res.json(createUseCases().suspend(req.params.id));
});

router.post('/:id/dissolve', requirePermission('company:update'), (req: AuthRequest, res: Response) => {
  res.json(createUseCases().dissolve(req.params.id, req.body.reason));
});

router.post('/:id/bankrupt', requirePermission('company:update'), (req: AuthRequest, res: Response) => {
  res.json(createUseCases().bankrupt(req.params.id));
});

router.post('/:id/convert', requirePermission('company:update'), (req: AuthRequest, res: Response) => {
  res.json(createUseCases().convert(req.params.id));
});

router.post('/:id/merge', requirePermission('company:update'), (req: AuthRequest, res: Response) => {
  res.json(createUseCases().merge(req.params.id));
});

// ─── Legal Representatives ───────────────────────────────

router.get('/:id/legal-reps', requirePermission('company:read'), (req: AuthRequest, res: Response) => {
  res.json(createUseCases().getLegalReps(req.params.id));
});

router.post('/:id/legal-reps', requirePermission('company:create'), (req: AuthRequest, res: Response) => {
  const uc = createUseCases();
  res.status(201).json(uc.addLegalRep(req.params.id, req.body));
});

router.put('/:companyId/legal-reps/:repId', requirePermission('company:update'), (req: AuthRequest, res: Response) => {
  const result = createUseCases().updateLegalRep(req.params.repId, req.body);
  if (!result) { res.status(404).json({ error: 'Legal representative not found' }); return; }
  res.json(result);
});

router.delete('/:companyId/legal-reps/:repId', requirePermission('company:update'), (req: AuthRequest, res: Response) => {
  createUseCases().deleteLegalRep(req.params.repId);
  res.status(204).send();
});

// ─── Capital Contributors ────────────────────────────────

router.get('/:id/contributors', requirePermission('company:read'), (req: AuthRequest, res: Response) => {
  res.json(createUseCases().getCapitalContributors(req.params.id));
});

router.post('/:id/contributors', requirePermission('company:create'), (req: AuthRequest, res: Response) => {
  res.status(201).json(createUseCases().addCapitalContributor(req.params.id, req.body));
});

// ─── Business Lines ──────────────────────────────────────

router.get('/:id/business-lines', requirePermission('company:read'), (req: AuthRequest, res: Response) => {
  res.json(createUseCases().getBusinessLines(req.params.id));
});

router.post('/:id/business-lines', requirePermission('company:create'), (req: AuthRequest, res: Response) => {
  res.status(201).json(createUseCases().addBusinessLine(req.params.id, req.body));
});

// ─── Bank Accounts ───────────────────────────────────────

router.get('/:id/bank-accounts', requirePermission('company:read'), (req: AuthRequest, res: Response) => {
  res.json(createUseCases().getBankAccounts(req.params.id));
});

router.post('/:id/bank-accounts', requirePermission('company:create'), (req: AuthRequest, res: Response) => {
  res.status(201).json(createUseCases().addBankAccount(req.params.id, req.body));
});

export default router;
