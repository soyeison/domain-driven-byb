import { Project } from '../aggregates/Project';

export interface ProjectRepository {
  save(project: Project): Promise<void>;
  findById(id: string): Promise<Project | null>;
  findByErpId(erpId: string): Promise<Project | null>;
  findAllActive(): Promise<Project[]>;
}
