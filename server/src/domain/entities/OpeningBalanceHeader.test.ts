import { describe, it, expect } from 'vitest';
import {
  createOBHeader,
  lockOBHeader,
  unlockOBHeader,
  approveOBHeader,
  rejectOBHeader,
  submitOBHeaderForApproval,
} from './OpeningBalanceHeader.js';
import { OpeningBalanceStatus, OpeningBalanceImportSource } from '../enums/OpeningBalanceEnums.js';

describe('OpeningBalanceHeader', () => {
  const base = {
    companyId: 1,
    periodId: 1,
    entryDate: '2026-01-01',
    createdByUserId: 1,
  };

  describe('createOBHeader', () => {
    it('creates header with draft status', () => {
      const h = createOBHeader(base);
      expect(h.status).toBe(OpeningBalanceStatus.Draft);
      expect(h.isLocked).toBe(false);
      expect(h.totalDebit).toBe(0);
      expect(h.totalCredit).toBe(0);
      expect(h.importSource).toBe(OpeningBalanceImportSource.Manual);
    });

    it('accepts import source override', () => {
      const h = createOBHeader({ ...base, importSource: OpeningBalanceImportSource.Excel });
      expect(h.importSource).toBe(OpeningBalanceImportSource.Excel);
    });
  });

  describe('lockOBHeader', () => {
    it('locks an unlocked header', () => {
      const h = createOBHeader(base);
      const locked = lockOBHeader(h, 2);
      expect(locked.isLocked).toBe(true);
      expect(locked.status).toBe(OpeningBalanceStatus.Locked);
      expect(locked.lockedByUserId).toBe(2);
      expect(locked.lockedAt).toBeDefined();
    });

    it('throws when already locked', () => {
      const h = createOBHeader(base);
      const locked = lockOBHeader(h, 1);
      expect(() => lockOBHeader(locked, 2)).toThrow('already locked');
    });
  });

  describe('unlockOBHeader', () => {
    it('unlocks a locked header', () => {
      const h = createOBHeader(base);
      const locked = lockOBHeader(h, 1);
      const unlocked = unlockOBHeader(locked, 1);
      expect(unlocked.isLocked).toBe(false);
      expect(unlocked.status).toBe(OpeningBalanceStatus.Draft);
    });

    it('throws when not locked', () => {
      const h = createOBHeader(base);
      expect(() => unlockOBHeader(h, 1)).toThrow('not locked');
    });
  });

  describe('submitOBHeaderForApproval', () => {
    it('submits draft for approval', () => {
      const h = createOBHeader(base);
      const submitted = submitOBHeaderForApproval(h);
      expect(submitted.status).toBe(OpeningBalanceStatus.PendingApproval);
    });

    it('throws when locked', () => {
      const h = createOBHeader(base);
      const locked = lockOBHeader(h, 1);
      expect(() => submitOBHeaderForApproval(locked)).toThrow('locked');
    });

    it('throws when not draft', () => {
      const h = createOBHeader(base);
      const submitted = submitOBHeaderForApproval(h);
      expect(() => submitOBHeaderForApproval(submitted)).toThrow('Only draft');
    });
  });

  describe('approveOBHeader', () => {
    it('approves pending header', () => {
      const h = createOBHeader(base);
      const submitted = submitOBHeaderForApproval(h);
      const approved = approveOBHeader(submitted, 2);
      expect(approved.status).toBe(OpeningBalanceStatus.Approved);
      expect(approved.approvedByUserId).toBe(2);
      expect(approved.approvedAt).toBeDefined();
    });

    it('throws when not pending', () => {
      const h = createOBHeader(base);
      expect(() => approveOBHeader(h, 1)).toThrow('not pending approval');
    });
  });

  describe('rejectOBHeader', () => {
    it('rejects and returns to draft', () => {
      const h = createOBHeader(base);
      const submitted = submitOBHeaderForApproval(h);
      const rejected = rejectOBHeader(submitted, 2, 'Số dư không khớp');
      expect(rejected.status).toBe(OpeningBalanceStatus.Draft);
      expect(rejected.rejectionReason).toBe('Số dư không khớp');
    });

    it('throws when not pending', () => {
      const h = createOBHeader(base);
      expect(() => rejectOBHeader(h, 1, 'no')).toThrow('not pending approval');
    });
  });
});
