import { ProjectRepository } from '../../domain/ports/ProjectRepository';

export class ActivateProjectUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  public async execute(projectId: string): Promise<void> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found.`);
    }

    project.activate();

    await this.projectRepository.save(project);
  }
}
