import { Project } from '../../domain/aggregates/Project';
import { ProjectRepository } from '../../domain/ports/ProjectRepository';

export interface CreateLaunchCommand {
  id: string;
  name: string;
}

export class CreateLaunchProjectUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  public async execute(command: CreateLaunchCommand) {
    const existingProject = await this.projectRepository.findById(command.id);
    if (existingProject) {
      throw new Error(`Project with ID ${command.id} already exists.`);
    }

    const newProject = new Project(command.id, command.name);

    await this.projectRepository.save(newProject);
  }
}
