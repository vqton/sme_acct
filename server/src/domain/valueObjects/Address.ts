export interface AddressParts {
  street: string;
  ward?: string;
  district?: string;
  province: string;
  wardCode?: string;
  districtCode?: string;
  provinceCode?: string;
}

export class Address {
  constructor(private readonly parts: AddressParts) {}

  static create(parts: AddressParts): Address {
    if (!parts.street.trim()) throw new Error('Street address is required');
    if (!parts.province.trim()) throw new Error('Province is required');
    return new Address({ ...parts });
  }

  toString(): string {
    const parts = [this.parts.street];
    if (this.parts.ward) parts.push(this.parts.ward);
    if (this.parts.district) parts.push(this.parts.district);
    parts.push(this.parts.province);
    return parts.join(', ');
  }

  get street(): string { return this.parts.street; }
  get ward(): string | undefined { return this.parts.ward; }
  get district(): string | undefined { return this.parts.district; }
  get province(): string { return this.parts.province; }
  get wardCode(): string | undefined { return this.parts.wardCode; }
  get districtCode(): string | undefined { return this.parts.districtCode; }
  get provinceCode(): string | undefined { return this.parts.provinceCode; }

  equals(other: Address): boolean {
    return this.toString() === other.toString();
  }

  toParts(): AddressParts {
    return { ...this.parts };
  }
}
