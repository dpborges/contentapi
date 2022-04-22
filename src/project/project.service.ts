import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectService {

  constructor(@InjectRepository(Project) private projectRepo: Repository<Project>) {}

  create(createProjectDto: CreateProjectDto) {
    return this.projectRepo.save(createProjectDto);
  }

  findAll() {
    return `This action returns all project`;
  }

  findOne(id: number) {
    return `This action returns a #${id} project`;
  }

  update(id: number, updateProjectDto: UpdateProjectDto) {
    return `This action updates a #${id} project`;
  }

  async remove(sessionObj, id: number) {
    const project = await this.findById(sessionObj.acct_id, id);
    if (!project) {
      throw new NotFoundException(`Project id: ${id} not found`)
    }
    return this.projectRepo.remove(project);
  }

  /**
   * Find project by id 
   * @param acct_id 
   * @param id
   * @returns Project
   */
   async findById(acct_id: number, id: number): Promise<Project> {  
    const [ projectEntity ] = await this.projectRepo.find({
      where: {
        acct_id,
        id
      }
    }); 
    return projectEntity; 
  }

}
