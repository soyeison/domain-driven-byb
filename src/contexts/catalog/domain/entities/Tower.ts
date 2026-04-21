import { ErpReference } from '../value-objects/ErpReference';
import { Apartment } from './Apartment';
import { ParkingSpace } from './ParkingSpace';
import { StorageUnit } from './StorageUnit';

export class Tower {
  private isVisible: boolean = false;
  private apartments: Apartment[] = [];
  private parkingSpaces: ParkingSpace[] = [];
  private storageUnits: StorageUnit[] = [];

  constructor(
    public readonly id: string,
    public readonly erpReference: ErpReference,
    public readonly name: string,
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

  // Apartment managment
  public addApartment(apartment: Apartment): void {
    this.apartments.push(apartment);
  }

  public activeApartment(apartmentId: string): void {
    if (!this.isVisible) {
      throw new Error(
        'Cannot activate apartment in a tower that is not active.',
      );
    }

    const apartment = this.apartments.find((a) => a.id === apartmentId);
    if (!apartment) throw new Error('Apartment not found in tower.');

    apartment.activate();
  }

  // --- Gestión de Parqueaderos ---
  public addParkingSpace(parkingSpace: ParkingSpace): void {
    this.parkingSpaces.push(parkingSpace);
  }

  // --- Gestión de Cuartos Útiles ---
  public addStorageUnit(storageUnit: StorageUnit): void {
    this.storageUnits.push(storageUnit);
  }

  public activateParkingSpace(parkingSpaceId: string): void {
    if (!this.isVisible) {
      throw new Error('Cannot activate parking space: Tower is inactive.');
    }
    const space = this.parkingSpaces.find((p) => p.id === parkingSpaceId);
    if (!space) throw new Error('Parking space not found.');
    space.activate();
  }

  public activateStorageUnit(storageUnitId: string): void {
    if (!this.isVisible) {
      throw new Error('Cannot activate storage unit: Tower is inactive.');
    }
    const unit = this.storageUnits.find((s) => s.id === storageUnitId);
    if (!unit) throw new Error('Storage unit not found.');
    unit.activate();
  }
}
