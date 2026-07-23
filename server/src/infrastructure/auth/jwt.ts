import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_EXPIRES_IN = '15m';
const ISSUER = 'sme-acct';
const AUDIENCE = 'sme-acct-client';

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is required');
  return secret;
}

export interface TokenPayload {
  userId: number;
  username: string;
  companyId?: number;
  roles?: string[];
  jti?: string;
}

export function generateToken(payload: TokenPayload): string {
  const jti = payload.jti ?? crypto.randomUUID();
  return jwt.sign(
    { ...payload, jti },
    getSecret(),
    { expiresIn: JWT_EXPIRES_IN, issuer: ISSUER, audience: AUDIENCE },
  );
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, getSecret(), { issuer: ISSUER, audience: AUDIENCE }) as TokenPayload;
}
