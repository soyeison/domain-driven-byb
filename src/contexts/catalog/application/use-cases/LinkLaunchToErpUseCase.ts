import { Tower } from '../../domain/entities/Tower';
import { ErpProvider } from '../../domain/ports/ErpProvider';
import { ErpProviderFactory } from '../../domain/ports/ErpProviderFactory';
import { ProjectRepository } from '../../domain/ports/ProjectRepository';
import {
  ErpReference,
  ErpSystem,
} from '../../domain/value-objects/ErpReference';

export class LinkLaunchToErpUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly erpProviderFactory: ErpProviderFactory,
    private readonly erpProvider: ErpProvider,
  ) {}

  private generateInternalId(): string {
    return '';
  }

  public async execute(
    internalProjectId: string,
    erpSystem: ErpSystem,
    externalId: string,
  ): Promise<void> {
    const project = await this.projectRepository.findById(internalProjectId);
    if (!project) {
      throw new Error(`Project with ID ${internalProjectId} not found`);
    }

    const erpProvider = this.erpProviderFactory.getProvider(erpSystem);
    if (!erpProvider) {
      throw new Error(`ERP provider for system ${erpSystem} not found`);
    }

    const erpData = await this.erpProvider.getProjectInfo(externalId);
    if (!erpData) {
      throw new Error(`ERP data for ID ${externalId} not found`);
    }

    project.linkToErp(erpSystem, erpData.externalId);

    for (const erpTower of erpData.towers) {
      const towerReference = new ErpReference(erpSystem, erpTower.externalId);
      const newTower = new Tower(
        this.generateInternalId(),
        towerReference,
        erpTower.name,
      );
      project.addTower(newTower);
    }

    await this.projectRepository.save(project);
  }
}
