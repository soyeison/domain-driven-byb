export class StorageUnit {
  private isVisible: boolean = false;

  constructor(
    public readonly id: string,
    public readonly erpReference: string,
    public readonly number: string, // Ej: "Cuarto Útil 4A"
  ) {}

  public activate(): void {
    this.isVisible = true;
  }
  public deactivate(): void {
    this.isVisible = false;
  }
  public isActive(): boolean {
    return this.isVisible;
  }
}
