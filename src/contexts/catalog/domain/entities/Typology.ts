import { FloorPlan } from '../value-objects/FloorPlan';

export class Typology {
  private amenities: string[] = []; // Ej: ["2 Habitaciones", "2 Baños", "Balcón"]
  private floorPlan: FloorPlan | null = null;

  constructor(
    public readonly id: string,
    public readonly name: string, // Ej: "Tipología A"
    public readonly constructedArea: number, // Metros cuadrados
  ) {}

  public addAmenity(amenity: string): void {
    this.amenities.push(amenity);
  }

  public setFloorPlan(floorPlan: FloorPlan): void {
    this.floorPlan = floorPlan;
  }

  public hasFloorPlan(): boolean {
    return this.floorPlan !== null;
  }
}
