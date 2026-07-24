import { TaxType } from '../domain/enums/TaxEnums.js';

export interface TaxCalendarEvent {
  id: number;
  companyId: number;
  taxType: TaxType;
  periodType: string;
  year: number;
  month?: number;
  quarter?: number;
  eventType: string;
  label: string;
  dueDate: string;
  isOverdue: boolean;
  resolvedAt?: string;
}

/**
 * Vietnamese tax deadlines per:
 * - VAT: monthly → 20th of next month, quarterly → 30th of next quarter
 * - CIT: quarterly provisional → 30th of next quarter, annual → 31 Mar next year
 * - PIT: monthly → 20th of next month, annual settlement → 31 Mar next year
 * - License tax: 30 Jan yearly
 */
export class TaxCalendarService {
  generateYearlyEvents(
    companyId: number,
    year: number,
    taxType: TaxType,
    periodType: string,
  ): TaxCalendarEvent[] {
    switch (taxType) {
      case TaxType.VAT:
        return this.generateVatEvents(companyId, year, periodType);
      case TaxType.CIT:
        return this.generateCitEvents(companyId, year, periodType);
      case TaxType.PIT:
        return this.generatePitEvents(companyId, year, periodType);
      case TaxType.License:
        return this.generateLicenseEvents(companyId, year);
      default:
        return [];
    }
  }

  private generateVatEvents(companyId: number, year: number, periodType: string): TaxCalendarEvent[] {
    if (periodType === 'monthly') {
      return Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const dueYear = month === 12 ? year + 1 : year;
        const dueMonth = month === 12 ? 1 : month + 1;
        return {
          id: 0, companyId, taxType: TaxType.VAT,
          periodType: 'monthly', year, month,
          eventType: 'deadline',
          label: `Thuế GTGT tháng ${month}/${year}`,
          dueDate: `${dueYear}-${String(dueMonth).padStart(2, '0')}-20`,
          isOverdue: false,
        };
      });
    }
    // quarterly
    return [
      { id: 0, companyId, taxType: TaxType.VAT, periodType: 'quarterly', year, quarter: 1, eventType: 'deadline', label: `Thuế GTGT quý 1/${year}`, dueDate: `${year}-04-30`, isOverdue: false },
      { id: 0, companyId, taxType: TaxType.VAT, periodType: 'quarterly', year, quarter: 2, eventType: 'deadline', label: `Thuế GTGT quý 2/${year}`, dueDate: `${year}-07-30`, isOverdue: false },
      { id: 0, companyId, taxType: TaxType.VAT, periodType: 'quarterly', year, quarter: 3, eventType: 'deadline', label: `Thuế GTGT quý 3/${year}`, dueDate: `${year}-10-30`, isOverdue: false },
      { id: 0, companyId, taxType: TaxType.VAT, periodType: 'quarterly', year, quarter: 4, eventType: 'deadline', label: `Thuế GTGT quý 4/${year}`, dueDate: `${year + 1}-01-30`, isOverdue: false },
    ];
  }

  private generateCitEvents(companyId: number, year: number, periodType: string): TaxCalendarEvent[] {
    if (periodType === 'yearly') {
      return [{
        id: 0, companyId, taxType: TaxType.CIT, periodType: 'yearly', year,
        eventType: 'annual-finalization',
        label: `Quyết toán thuế TNDN năm ${year}`,
        dueDate: `${year + 1}-03-31`,
        isOverdue: false,
      }];
    }
    return [
      { id: 0, companyId, taxType: TaxType.CIT, periodType: 'quarterly', year, quarter: 1, eventType: 'provisional', label: `Tạm tính TNDN quý 1/${year}`, dueDate: `${year}-04-30`, isOverdue: false },
      { id: 0, companyId, taxType: TaxType.CIT, periodType: 'quarterly', year, quarter: 2, eventType: 'provisional', label: `Tạm tính TNDN quý 2/${year}`, dueDate: `${year}-07-30`, isOverdue: false },
      { id: 0, companyId, taxType: TaxType.CIT, periodType: 'quarterly', year, quarter: 3, eventType: 'provisional', label: `Tạm tính TNDN quý 3/${year}`, dueDate: `${year}-10-30`, isOverdue: false },
      { id: 0, companyId, taxType: TaxType.CIT, periodType: 'quarterly', year, quarter: 4, eventType: 'annual-finalization', label: `Quyết toán thuế TNDN năm ${year}`, dueDate: `${year + 1}-03-31`, isOverdue: false },
    ];
  }

  private generatePitEvents(companyId: number, year: number, periodType: string): TaxCalendarEvent[] {
    if (periodType === 'yearly') {
      return [{
        id: 0, companyId, taxType: TaxType.PIT, periodType: 'yearly', year,
        eventType: 'annual-settlement',
        label: `Quyết toán thuế TNCN năm ${year}`,
        dueDate: `${year + 1}-03-31`,
        isOverdue: false,
      }];
    }
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const dueYear = month === 12 ? year + 1 : year;
      const dueMonth = month === 12 ? 1 : month + 1;
      return {
        id: 0, companyId, taxType: TaxType.PIT, periodType: 'monthly', year, month,
        eventType: 'withholding',
        label: `Khấu trừ TNCN tháng ${month}/${year}`,
        dueDate: `${dueYear}-${String(dueMonth).padStart(2, '0')}-20`,
        isOverdue: false,
      };
    });
  }

  private generateLicenseEvents(companyId: number, year: number): TaxCalendarEvent[] {
    return [{
      id: 0, companyId, taxType: TaxType.License, periodType: 'yearly', year,
      eventType: 'deadline',
      label: `Thuế môn bài năm ${year}`,
      dueDate: `${year}-01-30`,
      isOverdue: false,
    }];
  }

  generateAllEvents(companyId: number, year: number): TaxCalendarEvent[] {
    return [
      ...this.generateYearlyEvents(companyId, year, TaxType.VAT, 'monthly'),
      ...this.generateYearlyEvents(companyId, year, TaxType.CIT, 'quarterly'),
      ...this.generateYearlyEvents(companyId, year, TaxType.PIT, 'monthly'),
      ...this.generateYearlyEvents(companyId, year, TaxType.License, 'yearly'),
    ];
  }

  checkOverdue(events: TaxCalendarEvent[]): TaxCalendarEvent[] {
    const today = new Date().toISOString().slice(0, 10);
    return events.map(e => ({
      ...e,
      isOverdue: e.dueDate < today && !e.resolvedAt,
    }));
  }

  getUpcomingDeadlines(events: TaxCalendarEvent[], withinDays: number): TaxCalendarEvent[] {
    const today = new Date();
    const future = new Date(today);
    future.setDate(future.getDate() + withinDays);
    const todayStr = today.toISOString().slice(0, 10);
    const futureStr = future.toISOString().slice(0, 10);
    return events.filter(e =>
      e.dueDate >= todayStr && e.dueDate <= futureStr && !e.resolvedAt
    );
  }
}
