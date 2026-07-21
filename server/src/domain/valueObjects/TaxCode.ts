export class TaxCode {
  private constructor(private readonly value: string) {}

  static create(raw: string): TaxCode {
    const cleaned = raw.replace(/[.\-\s]/g, '');
    if (!/^\d{10}(\d{3})?$/.test(cleaned)) {
      throw new Error('Invalid tax code: must be 10 or 13 digits');
    }
    return new TaxCode(cleaned);
  }

  toString(): string {
    return this.value;
  }

  equals(other: TaxCode): boolean {
    return this.value === other.value;
  }
}
