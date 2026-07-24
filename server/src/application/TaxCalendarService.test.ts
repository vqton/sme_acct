import { describe, it, expect } from 'vitest';
import { TaxCalendarService } from './TaxCalendarService.js';
import { TaxType } from '../domain/enums/TaxEnums.js';

describe('TaxCalendarService', () => {
  const service = new TaxCalendarService();

  it('generates VAT monthly deadlines for the year', () => {
    const events = service.generateYearlyEvents(1, 2026, TaxType.VAT, 'monthly');
    expect(events).toHaveLength(12);
    expect(events[0].label).toBe('Thuế GTGT tháng 1/2026');
    expect(events[0].dueDate).toBe('2026-02-20');
    expect(events[11].dueDate).toBe('2027-01-20');
  });

  it('generates VAT quarterly deadlines', () => {
    const events = service.generateYearlyEvents(1, 2026, TaxType.VAT, 'quarterly');
    expect(events).toHaveLength(4);
    expect(events[0].dueDate).toBe('2026-04-30');
    expect(events[1].dueDate).toBe('2026-07-30');
    expect(events[2].dueDate).toBe('2026-10-30');
    expect(events[3].dueDate).toBe('2027-01-30');
  });

  it('generates CIT quarterly deadlines', () => {
    const events = service.generateYearlyEvents(1, 2026, TaxType.CIT, 'quarterly');
    expect(events).toHaveLength(4);
    expect(events[0].label).toMatch(/Tạm tính/);
    expect(events[3].label).toMatch(/Quyết toán/);
  });

  it('generates CIT annual deadline', () => {
    const events = service.generateYearlyEvents(1, 2026, TaxType.CIT, 'yearly');
    expect(events).toHaveLength(1);
    expect(events[0].dueDate).toBe('2027-03-31');
  });

  it('generates PIT monthly deadlines', () => {
    const events = service.generateYearlyEvents(1, 2026, TaxType.PIT, 'monthly');
    expect(events).toHaveLength(12);
    expect(events[0].dueDate).toBe('2026-02-20');
  });

  it('generates PIT annual settlement deadline', () => {
    const events = service.generateYearlyEvents(1, 2026, TaxType.PIT, 'yearly');
    expect(events).toHaveLength(1);
    expect(events[0].dueDate).toBe('2027-03-31');
  });

  it('generates license tax annual deadline', () => {
    const events = service.generateYearlyEvents(1, 2026, TaxType.License, 'yearly');
    expect(events).toHaveLength(1);
    expect(events[0].dueDate).toBe('2026-01-30');
  });

  it('flags overdue events', () => {
    const events = service.generateYearlyEvents(1, 2025, TaxType.VAT, 'monthly');
    const overdue = service.checkOverdue(events);
    expect(overdue.length).toBeGreaterThan(0);
    expect(overdue[0].isOverdue).toBe(true);
  });

  it('identifies upcoming events within days', () => {
    const events = service.generateYearlyEvents(1, 2026, TaxType.VAT, 'monthly');
    const upcoming = service.getUpcomingDeadlines(events, 15);
    expect(Array.isArray(upcoming)).toBe(true);
  });

  it('generates events for all tax types', () => {
    const all = service.generateAllEvents(1, 2026);
    expect(all.length).toBeGreaterThanOrEqual(12);
  });
});
