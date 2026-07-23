import { describe, it, expect, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { generateToken, verifyToken } from './jwt.js';

const SECRET = 'test-secret-key-not-for-production';

function decodePayload(token: string): Record<string, unknown> {
  const [, payloadB64] = token.split('.');
  return JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
}

describe('JWT', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = SECRET;
  });

  describe('token expiry', () => {
    it('access token expires in 15 minutes', () => {
      const token = generateToken({ userId: 1, username: 'test', roles: [] });
      const payload = decodePayload(token);

      expect(payload.exp).toBeDefined();
      const issuedAt = payload.iat as number;
      const expiresAt = payload.exp as number;
      const diffSeconds = expiresAt - issuedAt;

      expect(diffSeconds).toBe(15 * 60);
    });

    it('token is invalid after expiry', () => {
      const token = jwt.sign(
        { userId: 1, username: 'test', roles: [] },
        SECRET,
        { expiresIn: '-1s' },
      );

      expect(() => verifyToken(token)).toThrow();
    });
  });

  describe('token claims', () => {
    it('includes iss (issuer) claim', () => {
      const token = generateToken({ userId: 1, username: 'test', roles: [] });
      const payload = decodePayload(token);

      expect(payload.iss).toBe('sme-acct');
    });

    it('includes aud (audience) claim', () => {
      const token = generateToken({ userId: 1, username: 'test', roles: [] });
      const payload = decodePayload(token);

      expect(payload.aud).toBe('sme-acct-client');
    });

    it('includes jti (token id) claim', () => {
      const token = generateToken({ userId: 1, username: 'test', roles: [], jti: 'unique-id-123' });
      const payload = decodePayload(token);

      expect(payload.jti).toBe('unique-id-123');
    });

    it('includes userId, username, and roles', () => {
      const token = generateToken({ userId: 1, username: 'test', roles: ['ke-toan-vien'] });
      const payload = decodePayload(token);

      expect(payload.userId).toBe(1);
      expect(payload.username).toBe('test');
      expect(payload.roles).toEqual(['ke-toan-vien']);
    });

    it('generates unique jti when not provided', () => {
      const t1 = generateToken({ userId: 1, username: 'test', roles: [] });
      const t2 = generateToken({ userId: 1, username: 'test', roles: [] });

      const p1 = decodePayload(t1);
      const p2 = decodePayload(t2);

      expect(p1.jti).toBeDefined();
      expect(p2.jti).toBeDefined();
      expect(p1.jti).not.toBe(p2.jti);
    });
  });

  describe('verifyToken', () => {
    it('returns decoded payload for valid token', () => {
      const token = generateToken({ userId: 1, username: 'test', roles: ['admin'] });
      const payload = verifyToken(token);

      expect(payload.userId).toBe(1);
      expect(payload.username).toBe('test');
      expect(payload.roles).toEqual(['admin']);
    });

    it('rejects token signed with wrong secret', () => {
      const token = jwt.sign({ userId: 1 }, 'wrong-secret', { expiresIn: '15m' });
      expect(() => verifyToken(token)).toThrow();
    });
  });
});
