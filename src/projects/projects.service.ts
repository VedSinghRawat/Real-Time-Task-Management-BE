import { Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { projects, projectUsers } from 'src/database/database.schema'
import { and, eq } from 'drizzle-orm'

@Injectable()
export class ProjectsService {
  private db: DatabaseService['db']

  constructor(_: DatabaseService) {
    this.db = _.db
  }

  async create(proj: typeof projects.$inferInsert, ownerId: number) {
    const project = (await this.db.insert(projects).values(proj).returning())[0]!
    const projectUser = (
      await this.db
        .insert(projectUsers)
        .values({ projectId: project.id, userId: ownerId, role: 'owner' as const })
        .returning()
    )[0]!

    return { project, projectUser }
  }

  async findAll() {
    return await this.db.select().from(projects)
  }

  async findOne(id: number) {
    return (await this.db.select().from(projects).where(eq(projects.id, id)))[0]
  }

  async update(id: number, updateProjectDto: Partial<typeof projects.$inferInsert>) {
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

    return { project: projs, projectUser: projUs }
  }

  async isOwner(projectId: number, userId: number) {
    const projUser = (
      await this.db
        .select()
        .from(projectUsers)
        .where(and(eq(projectUsers.projectId, projectId), eq(projectUsers.role, 'owner')))
    )[0]

    return projUser?.userId === userId
  }
}
