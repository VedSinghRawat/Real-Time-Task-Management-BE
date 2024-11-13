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
import projectsDto, { ProjectCreateDTO, ProjectUpdateDTO } from './dto/projects.dto'
import { JwtAuthGuard } from 'src/auth/gaurds/jwt/jwt.guard'
import { User } from 'src/database/database.schema'
import { FileInterceptor } from '@nestjs/platform-express'
import { encrypt } from 'src/util'
import { S3Service } from 'src/s3/s3.service'
import { EnviromentVariables } from 'src/interfaces/config'
import { ConfigService } from '@nestjs/config'
import path from 'path'

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService<EnviromentVariables>
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UsePipes(projectsDto.createValidator)
  @UseInterceptors(FileInterceptor('image'))
  async create(@Body() createProjectDto: ProjectCreateDTO, @Req() req: Request & { user: User }, @UploadedFile() imageFile: Express.Multer.File) {
    const project = await this.projectsService.create({ ...createProjectDto, ownerId: req.user.id })
    if (!imageFile) return { project }

    const imageHash = await encrypt(`${project.id}-proj-image`)
    const imageKey = `${imageHash}.${path.extname(imageFile.originalname)}`
    const bucketName = this.configService.get('BUCKET_NAME', { infer: true })
    if (!bucketName) throw 'No BUCKET_NAME found in env'

    try {
      await this.s3Service.putObject(bucketName, imageKey, imageFile.buffer, { ContentType: imageFile.mimetype })

      const updatedProj = await this.projectsService.update(project.id, { image: imageKey })

      return { project: updatedProj }
    } catch (err) {
      await this.projectsService.remove(project.id)
      return { error: err }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async listMine(@Req() req: Request & { user: User }) {
    const data = await this.projectsService.listByUser(req.user.id)
    return data
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
