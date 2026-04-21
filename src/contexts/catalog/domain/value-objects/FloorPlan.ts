export class FloorPlan {
  constructor(
    public readonly imageUrl: string,
    public readonly description?: string,
  ) {}

  public equals(other: FloorPlan): boolean {
    return this.imageUrl === other.imageUrl;
  }
}
