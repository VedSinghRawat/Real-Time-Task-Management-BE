import { Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { projects, projectUsers } from 'src/database/database.schema'
import { and, eq } from 'drizzle-orm'
import { encrypt } from 'src/util'
import * as path from 'path'
import { ConfigService } from '@nestjs/config'
import { EnviromentVariables } from 'src/interfaces/config'
import { S3Service } from 'src/s3/s3.service'

@Injectable()
export class ProjectsService {
  private db: DatabaseService['db']

  constructor(
    _: DatabaseService,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService<EnviromentVariables>
  ) {
    this.db = _.db
  }

  async create(proj: typeof projects.$inferInsert, ownerId: number, imageFile?: Express.Multer.File) {
    const project = (await this.db.insert(projects).values(proj).returning())[0]!
    const projectUser = (
      await this.db
        .insert(projectUsers)
        .values({ projectId: project.id, userId: ownerId, role: 'owner' as const })
        .returning()
    )[0]!

    if (!imageFile) return { project, projectUser }

    try {
      const proj = await this.uploadImage(project, imageFile)
      return { project: proj, projectUser }
    } catch (error) {
      await this.remove(project)
      throw error
    }
  }

  async findAll() {
    return await this.db.select().from(projects)
  }

  async findOne(id: number) {
    return (await this.db.select().from(projects).where(eq(projects.id, id)))[0]
  }

  async update(curr: typeof projects.$inferSelect, updateProjectDto: Partial<typeof projects.$inferInsert>, imageFile?: Express.Multer.File) {
    if (imageFile) {
      if (curr.image) await this.deleteImage(curr.image)
      await this.uploadImage(curr, imageFile)
    }

    return (await this.db.update(projects).set(updateProjectDto).where(eq(projects.id, curr.id)).returning())[0]!
  }

  async remove(curr: typeof projects.$inferSelect) {
    try {
      if (curr.image) await this.deleteImage(curr.image)
    } catch (error) {
      console.error(error)
    }

    return (await this.db.delete(projects).where(eq(projects.id, curr.id)).returning())[0]!
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

  async uploadImage(project: typeof projects.$inferSelect, imageFile: Express.Multer.File) {
    const projectId = project.id

    const imageHash = await encrypt(`${projectId}-proj-image`)
    const imageKey = `images/projects/${imageHash.replaceAll('/', '')}${path.extname(imageFile.originalname)}`
    const bucketName = this.configService.get('BUCKET_NAME', { infer: true })
    if (!bucketName) throw 'No BUCKET_NAME found in env'

    await this.s3Service.putObject(bucketName, imageKey, imageFile.buffer, { ContentType: imageFile.mimetype })

    return await this.update(project, { image: imageKey })
  }

  async deleteImage(projectImage: string) {
    const bucketName = this.configService.get('BUCKET_NAME', { infer: true })
    if (!bucketName) throw 'No BUCKET_NAME found in env'

    await this.s3Service.deleteObject(bucketName, projectImage)
  }
}
