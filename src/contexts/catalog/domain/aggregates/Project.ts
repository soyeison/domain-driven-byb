import { Apartment } from '../entities/Apartment';
import { Tower } from '../entities/Tower';
import { Typology } from '../entities/Typology';
import { CmsAsset } from '../value-objects/CmsAsset';
import { ErpReference, ErpSystem } from '../value-objects/ErpReference';

export enum ProjectStatus {
  LAUNCH = 'LAUNCH',
  PENDING_CMS_CONTENT = 'PENDING_CMS_CONTENT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class Project {
  private readonly id: string;
  private erpReferences: ErpReference[] = [];
  private status: ProjectStatus;
  private cmsAssets: CmsAsset[] = [];
  private towers: Tower[] = [];
  private typologies: Typology[] = [];

  constructor(id: string, name: string) {
    this.id = id;
    this.status = ProjectStatus.LAUNCH;
  }

  public getId(): string {
    return this.id;
  }

  public linkToErp(erpReference: ErpReference): void {
    const alreadyLinked = this.erpReferences.find(
      (ref) => ref.system === erpReference.system,
    );
    if (alreadyLinked) {
      throw new Error(
        `Project is already linked to an ERP system of type ${erpReference.system}.`,
      );
    }

    this.erpReferences.push(erpReference);
    this.status = ProjectStatus.PENDING_CMS_CONTENT;
  }

  public addCmsContent(asset: CmsAsset): void {
    this.cmsAssets.push(asset);
  }

  public activate(): void {
    if (this.status === ProjectStatus.ACTIVE) {
      return;
    }

    if (this.cmsAssets.length === 0) {
      throw new Error('Cannot activate project without CMS content.');
    }
    if (this.erpReferences.length === 0) {
      throw new Error('Cannot activate project without linking to ERP system.');
    }

    this.status = ProjectStatus.ACTIVE;
  }

  public deactivate(): void {
    if (this.status === ProjectStatus.INACTIVE) {
      return;
    }
    this.status = ProjectStatus.INACTIVE;
  }

  public isActive(): boolean {
    return this.status === ProjectStatus.ACTIVE;
  }

  // Gestion de torres
  public addTower(tower: Tower): void {
    const isProjectLinkedToTowerErp = this.erpReferences.some(
      (ref) => ref.system === tower.erpReference.system,
    );

    if (!isProjectLinkedToTowerErp) {
      throw new Error(
        `Cannot add tower from ${tower.erpReference.system}. ` +
          `Link the project to this ERP first.`,
      );
    }

    this.towers.push(tower);
  }

  public activateTower(towerId: string): void {
    const tower = this.towers.find((t) => t.id === towerId);
    if (!tower) throw new Error('Tower not found in project.');

    tower.activate();
  }

  public deactivateTower(towerId: string): void {
    const tower = this.towers.find((t) => t.id === towerId);
    if (!tower) throw new Error('Tower not found in project.');

    tower.deactivate();
  }

  // Gestion de apartamentos
  public async addApartment(towerId: string, apartment: Apartment) {
    const tower = this.towers.find((t) => t.id === towerId);
    if (!tower) throw new Error('Tower not found in project.');

    const isProjectLinkedToApartmentErp = this.erpReferences.some(
      (ref) => ref.system === tower.erpReference.system,
    );

    if (!isProjectLinkedToApartmentErp) {
      throw new Error(
        `Cannot add apartment linked to ${tower.erpReference.system}. ` +
          `Link the project to this ERP first.`,
      );
    }

    tower.addApartment(apartment);
  }

  public activeApartment(towerId: string, apartmentId: string): void {
    const tower = this.towers.find((t) => t.id === towerId);
    if (!tower) throw new Error('Tower not found in project.');

    tower.activeApartment(apartmentId);
  }

  public deactivateApartment(towerId: string, apartmentId: string): void {
    const tower = this.towers.find((t) => t.id === towerId);
    if (!tower) throw new Error('Tower not found in project.');

    tower.deactivateApartment(apartmentId);
  }

  // Este método es el que permite saber si efectivamente un apartamento es comercializable, evitando las reglas de estados rígidas
  public isApartmentMarketable(towerId: string, apartmentId: string): boolean {
    if (this.status !== ProjectStatus.ACTIVE) return false;

    const tower = this.towers.find((t) => t.id === towerId);
    if (!tower || !tower.isActive()) return false;

    if (!tower.isApartmentActive(apartmentId)) return false;

    return true;
  }

  // Gestion de parqueaderos
  public activateParkingSpace(towerId: string, parkingSpaceId: string): void {
    if (this.status !== ProjectStatus.ACTIVE) {
      throw new Error(
        'Cannot activate parking space in a project that is not active.',
      );
    }

    const tower = this.towers.find((t) => t.id === towerId);
    if (!tower) throw new Error('Tower not found in project.');

    if (!tower.isActive()) {
      throw new Error(
        'Cannot activate parking space in a tower that is not active.',
      );
    }

    tower.activateParkingSpace(parkingSpaceId);
  }

  // Gestion de cuartos utiles
  public activateStorageUnit(towerId: string, storageUnitId: string): void {
    if (this.status !== ProjectStatus.ACTIVE) {
      throw new Error(
        'Cannot activate storage unit in a project that is not active.',
      );
    }

    const tower = this.towers.find((t) => t.id === towerId);
    if (!tower) throw new Error('Tower not found in project.');

    if (!tower.isActive()) {
      throw new Error(
        'Cannot activate storage unit in a tower that is not active.',
      );
    }

    tower.activateStorageUnit(storageUnitId);
  }

  // Gestion de tipologias
  public addTypology(typology: Typology): void {
    const exists = this.typologies.some(
      (t) => t.id === typology.id || t.name === typology.name,
    );
    if (exists) {
      throw new Error(
        `Typology with id ${typology.id} or name ${typology.name} already exists in the project.`,
      );
    }
    this.typologies.push(typology);
  }

  public verifyTypologyExists(typologyId: string): void {
    const exists = this.typologies.some((t) => t.id === typologyId);
    if (!exists) {
      throw new Error(
        `Typology with id ${typologyId} does not exist in the project.`,
      );
    }
  }
}
