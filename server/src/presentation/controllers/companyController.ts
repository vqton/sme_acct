import { Router, Response } from 'express';
import { CompanyUseCases } from '../../application/CompanyUseCases.js';
import { SQLiteCompanyRepository } from '../../infrastructure/database/CompanyRepository.js';
import { authMiddleware, requirePermission, AuthRequest } from '../middleware/auth.js';

const router = Router();
const useCases = new CompanyUseCases(new SQLiteCompanyRepository());

router.use(authMiddleware);

router.get('/', requirePermission('company:read'), (_req: AuthRequest, res: Response) => {
  res.json(useCases.list());
});

router.get('/:id', requirePermission('company:read'), (req: AuthRequest, res: Response) => {
  res.json(useCases.getById(req.params.id));
});

router.post('/', requirePermission('company:create'), (req: AuthRequest, res: Response) => {
  const company = useCases.create(req.body);
  res.status(201).json(company);
});

router.post('/:id/activate', requirePermission('company:update'), (req: AuthRequest, res: Response) => {
  res.json(useCases.activate(req.params.id));
});

router.post('/:id/suspend', requirePermission('company:update'), (req: AuthRequest, res: Response) => {
  res.json(useCases.suspend(req.params.id));
});

export default router;
