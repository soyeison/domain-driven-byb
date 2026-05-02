export type ErpSystem = 'SINCO' | 'NOVA';

export class ErpReference {
  constructor(
    public readonly system: ErpSystem,
    public readonly externalId: string,
    public readonly originalName: string,
  ) {}

  public equals(other: ErpReference): boolean {
    return this.system === other.system && this.externalId === other.externalId;
  }
}
