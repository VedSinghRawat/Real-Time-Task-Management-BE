import { Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { projects, projectUsers } from 'src/database/database.schema'
import projectsDto from './dto/projects.dto'
import { z } from 'zod'
import { eq } from 'drizzle-orm'

@Injectable()
export class ProjectsService {
  private db: DatabaseService['db']

  constructor(_: DatabaseService) {
    this.db = _.db
  }

  async create(proj: typeof projects.$inferInsert) {
    return await this.db.insert(projects).values(proj).returning()
  }

  async findAll() {
    return await this.db.select().from(projects)
  }

  async findOne(id: number) {
    return (await this.db.select().from(projects).where(eq(projects.id, id)))[0]
  }

  async update(id: number, updateProjectDto: z.infer<typeof projectsDto.updateSchema>) {
    return await this.db.update(projects).set(updateProjectDto).where(eq(projects.id, id))
  }

  async remove(id: number) {
    return await this.db.delete(projects).where(eq(projects.id, id))
  }

  async listByUser(userId: number) {
    const res = await this.db.query.projectUsers.findMany({
      where: eq(projectUsers.userId, userId),
      with: { project: true },
    })

    const projs: (typeof projects.$inferSelect)[] = []
    const projUs: (typeof projectUsers.$inferSelect)[] = []

    res.forEach(({ project, ...projectUser }) => {
      projs.push(project)
      projUs.push(projectUser)
    })

    return { projects: projs, projectUsers: projUs }
  }
}
