import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { v4 as uuidv4 } from 'uuid';

const sessionObj = { acct_id: 100, creator_id: uuidv4() };

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post(':name')
  create(@Param('name') name: string) {
    const createProjectDto: CreateProjectDto = { acct_id: sessionObj.acct_id, name };
    return this.projectService.create(createProjectDto);
  }

  @Get()
  findAll() {
    return this.projectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(+id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectService.remove(sessionObj, +id);
  }
}
