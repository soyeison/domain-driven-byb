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

  public linkToErp(system: ErpSystem, externalId: string): void {
    const alreadyLinked = this.erpReferences.find(
      (ref) => ref.system === system,
    );
    if (alreadyLinked) {
      throw new Error(
        `Project is already linked to an ERP system of type ${system}.`,
      );
    }

    this.erpReferences.push(new ErpReference(system, externalId));
    this.status = ProjectStatus.PENDING_CMS_CONTENT;
  }

  public addCmsContent(asset: CmsAsset): void {
    this.cmsAssets.push(asset);
  }

  public activate(): void {
    if (this.cmsAssets.length === 0) {
      throw new Error('Cannot activate project without CMS content.');
    }
    if (this.erpReferences.length === 0) {
      throw new Error('Cannot activate project without linking to ERP system.');
    }

    this.status = ProjectStatus.ACTIVE;
  }

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

  public activeApartment(towerId: string, apartmentId: string): void {
    if (this.status !== ProjectStatus.ACTIVE) {
      throw new Error(
        'Cannot activate apartment in a project that is not active.',
      );
    }

    const tower = this.towers.find((t) => t.id === towerId);
    if (!tower) throw new Error('Tower not found in project.');

    tower.activate();
    tower.activeApartment(apartmentId);
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
