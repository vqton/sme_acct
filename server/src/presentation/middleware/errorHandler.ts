import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('Error:', err.message);

  if (err.message.includes('not found') || err.message.includes('Not found')) {
    res.status(404).json({ error: err.message });
    return;
  }

  if (err.message.includes('already') || err.message.includes('Invalid')) {
    res.status(400).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
}
