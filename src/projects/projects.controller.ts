import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  UseGuards,
  Req,
  ForbiddenException,
  NotFoundException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { ProjectsService } from './projects.service'
import projectsDto, { ProjectUpdateDTO } from './dto/projects.dto'
import { JwtAuthGuard } from 'src/auth/gaurds/jwt/jwt.guard'
import { User } from 'src/database/database.schema'
import { FileInterceptor } from '@nestjs/platform-express'

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @UsePipes()
  async create(@Body() body: unknown, @UploadedFile() imageFile: Express.Multer.File, @Req() req: Request & { user: User }) {
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
  @UsePipes(projectsDto.updateValidator)
  async update(@Param('id') id: string, @Body() updateProjectDto: ProjectUpdateDTO, @Req() req: Request & { user: User }) {
    const project = await this.projectsService.findOne(+id)

    if (!project) throw new NotFoundException('Project not found')

    if (!(await this.projectsService.isOwner(+id, req.user.id))) throw new ForbiddenException('You are not authorized to update this project')

    return this.projectsService.update(project, updateProjectDto)
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request & { user: User }) {
    const project = await this.projectsService.findOne(+id)

    if (!project) throw new NotFoundException('Project not found')

    if (!(await this.projectsService.isOwner(project.id, req.user.id))) throw new ForbiddenException('You are not authorized to delete this project')

    return this.projectsService.remove(project)
  }
}
