export class Apartment {
  private isVisible: boolean = false;

  constructor(
    public readonly id: string,
    public readonly externalId: string,
    public readonly number: string,
    public readonly typologyId: string,
  ) {}

  public activate(): void {
    if (this.isVisible) {
      return;
    }
    this.isVisible = true;
  }

  public deactivate(): void {
    if (!this.isVisible) {
      return;
    }
    this.isVisible = false;
  }

  public isActive(): boolean {
    return this.isVisible;
  }
}
