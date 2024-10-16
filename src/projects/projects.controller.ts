import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, UseGuards, Req, ForbiddenException, NotFoundException } from '@nestjs/common'
import { ProjectsService } from './projects.service'
import projectsDto, { ProjectCreateDTO, ProjectUpdateDTO } from './dto/projects.dto'
import { JwtAuthGuard } from 'src/auth/gaurds/jwt/jwt.guard'
import { User } from 'src/database/database.schema'

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UsePipes(projectsDto.createValidator)
  create(@Body() createProjectDto: ProjectCreateDTO, @Req() req: Request & { user: User }) {
    return this.projectsService.create({ ...createProjectDto, ownerId: req.user.id })
  }

  @Get()
  findAll() {
    return this.projectsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(+id)
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UsePipes(projectsDto.updateValidator)
  async update(@Param('id') id: string, @Body() updateProjectDto: ProjectUpdateDTO, @Req() req: Request & { user: User }) {
    const project = await this.projectsService.findOne(+id)

    if (!project) {
      throw new NotFoundException('Project not found')
    }

    if (project.ownerId !== req.user.id) {
      throw new ForbiddenException('You are not authorized to update this project')
    }

    return this.projectsService.update(+id, updateProjectDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(+id)
  }
}
