import { Injectable } from '@nestjs/common'
import { CreateProjectDto } from './dto/create-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'
import { DatabaseService } from 'src/database/database.service'
import { projects } from 'src/database/database.schema'

@Injectable()
export class ProjectsService {
  private db: DatabaseService['db']

  constructor(_: DatabaseService) {
    this.db = _.db
  }

  create(createProjectDto: CreateProjectDto) {
    return this.db.insert(projects).values(createProjectDto).returning()
  }

  findAll() {
    return `This action returns all projects`
  }

  findOne(id: number) {
    return `This action returns a #${id} project`
  }

  update(id: number, updateProjectDto: UpdateProjectDto) {
    return `This action updates a #${id} project`
  }

  remove(id: number) {
    return `This action removes a #${id} project`
  }
}
