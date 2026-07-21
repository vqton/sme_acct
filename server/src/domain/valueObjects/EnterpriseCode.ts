const ENTERPRISE_CODE_PATTERN = /^\d{10}$/;

export class EnterpriseCode {
  private constructor(private readonly value: string) {}

  static create(raw: string): EnterpriseCode {
    const cleaned = raw.replace(/[.\-\s]/g, '');
    if (!ENTERPRISE_CODE_PATTERN.test(cleaned)) {
      throw new Error('Invalid enterprise code: must be exactly 10 digits');
    }
    return new EnterpriseCode(cleaned);
  }

  toString(): string {
    return this.value;
  }

  equals(other: EnterpriseCode): boolean {
    return this.value === other.value;
  }

  getRegistrationYear(): number {
    const yearPrefix = parseInt(this.value.substring(0, 2), 10);
    return 2000 + yearPrefix;
  }

  getProvinceCode(): string {
    return this.value.substring(2, 4);
  }

  getSerialNumber(): string {
    return this.value.substring(4);
  }
}
