import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
  NotFoundException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { ProjectsService } from './projects.service'
import projectsDto from './dto/projects.dto'
import { JwtAuthGuard } from 'src/auth/gaurds/jwt/jwt.guard'
import { User } from 'src/database/database.schema'
import { FileInterceptor } from '@nestjs/platform-express'
import { FormDataParse } from 'src/dto.util'

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(@Body(new FormDataParse()) body: unknown, @UploadedFile() imageFile: Express.Multer.File, @Req() req: Request & { user: User }) {
    const createProjectDto = projectsDto.createValidator.transform(body)

    const data = await this.projectsService.create(createProjectDto, req.user.id, imageFile)

    return data
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async listMine(@Req() req: Request & { user: User }) {
    return await this.projectsService.listByUser(req.user.id)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(+id)
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body(new FormDataParse()) body: unknown,
    @UploadedFile() imageFile: Express.Multer.File,
    @Req() req: Request & { user: User }
  ) {
    const updateProjectDto = projectsDto.updateValidator.transform(body)

    const project = await this.projectsService.findOne(+id)

    if (!project) throw new NotFoundException('Project not found')

    if (!(await this.projectsService.isOwner(+id, req.user.id))) throw new ForbiddenException('You are not authorized to update this project')

    const updatedProject = await this.projectsService.update(project, updateProjectDto, imageFile)
    return { project: updatedProject }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request & { user: User }) {
    const project = await this.projectsService.findOne(+id)

    if (!project) throw new NotFoundException('Project not found')

    if (!(await this.projectsService.isOwner(project.id, req.user.id))) throw new ForbiddenException('You are not authorized to delete this project')

    const deletedProject = await this.projectsService.remove(project)
    return { project: deletedProject }
  }
}
