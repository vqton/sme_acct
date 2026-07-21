import express from 'express';
import cors from 'cors';
import authController from './controllers/authController.js';
import companyController from './controllers/companyController.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    name: 'SME Accounting API',
    version: '0.1.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/login | /api/auth/register',
      companies: '/api/companies',
    },
    client: 'http://localhost:5173',
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authController);
app.use('/api/companies', companyController);

app.use(errorHandler);

export default app;
