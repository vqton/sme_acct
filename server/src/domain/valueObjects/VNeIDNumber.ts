const VNEID_PATTERN = /^\d{12}$/;

export class VNeIDNumber {
  private constructor(private readonly value: string) {}

  static create(raw: string): VNeIDNumber {
    const cleaned = raw.replace(/[.\-\s]/g, '');
    if (!VNEID_PATTERN.test(cleaned)) {
      throw new Error('Invalid VNeID number: must be exactly 12 digits');
    }
    return new VNeIDNumber(cleaned);
  }

  toString(): string {
    return this.value;
  }

  equals(other: VNeIDNumber): boolean {
    return this.value === other.value;
  }

  isSameAs(other: VNeIDNumber): boolean {
    return this.value === other.value;
  }

  getBirthCentury(): number {
    const cc = parseInt(this.value.charAt(0), 10);
    if (cc === 0) return 2000;
    if (cc === 1) return 1900;
    return 2000;
  }
}
