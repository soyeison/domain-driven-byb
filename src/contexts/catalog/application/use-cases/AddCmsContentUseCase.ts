import { ProjectRepository } from '../../domain/ports/ProjectRepository';
import { CmsAsset } from '../../domain/value-objects/CmsAsset';

export interface AddCmsContentCommand {
  projectId: string;
  assetType: string;
  assetUrl: string;
}

export class AddCmsContentUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  public async execute(command: AddCmsContentCommand) {
    const project = await this.projectRepository.findById(command.projectId);
    if (!project) {
      throw new Error(`Project with ID ${command.projectId} not found.`);
    }

    const asset = new CmsAsset(command.assetType, command.assetUrl);

    project.addCmsContent(asset);

    await this.projectRepository.save(project);
  }
}
