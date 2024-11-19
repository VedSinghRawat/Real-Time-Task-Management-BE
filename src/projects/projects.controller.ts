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
import { encrypt } from 'src/util'
import { S3Service } from 'src/s3/s3.service'
import { EnviromentVariables } from 'src/interfaces/config'
import { ConfigService } from '@nestjs/config'
import path from 'path'
import { FileInterceptor } from '@nestjs/platform-express'

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService<EnviromentVariables>
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @UsePipes()
  async create(@Body() body: unknown, @UploadedFile() imageFile: Express.Multer.File, @Req() req: Request & { user: User }) {
    const createProjectDto = projectsDto.createValidator.transform(body)

    const data = await this.projectsService.create(createProjectDto, req.user.id)
    if (!imageFile) return data

    const proj = data.project

    const imageHash = await encrypt(`${proj.id}-proj-image`)
    const imageKey = `${imageHash}.${path.extname(imageFile.originalname)}`
    const bucketName = this.configService.get('BUCKET_NAME', { infer: true })
    if (!bucketName) throw 'No BUCKET_NAME found in env'

    try {
      await this.s3Service.putObject(bucketName, imageKey, imageFile.buffer, { ContentType: imageFile.mimetype })

      const updatedProj = await this.projectsService.update(proj.id, { image: imageKey })

      return { project: updatedProj, projectUser: data.projectUser }
    } catch (err) {
      await this.projectsService.remove(proj.id)
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

    if (!(await this.projectsService.isOwner(+id, req.user.id))) {
      throw new ForbiddenException('You are not authorized to update this project')
    }

    return this.projectsService.update(+id, updateProjectDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(+id)
  }
}
