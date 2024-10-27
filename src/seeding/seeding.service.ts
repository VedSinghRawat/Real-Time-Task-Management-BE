import { Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { faker } from '@faker-js/faker'
import { Project, projects, ProjectUser, projectUsers, Task, tasks, taskUsers, User, users } from 'src/database/database.schema'
import { and, inArray } from 'drizzle-orm'
import { hash } from 'bcrypt'
import { SALT_ROUNDS } from 'src/constants'

@Injectable()
export class SeedingService {
  private db: DatabaseService['db']

  constructor(_: DatabaseService) {
    this.db = _.db
  }

  async users() {
    console.log('Seeding users')
    console.time('Users seeding')
    const currUsers = await this.db.select().from(users)
    if (currUsers.length) {
      console.log('Users already seeded')
      console.timeEnd('Users seeding')
      return currUsers
    }

    const emails = new Set<string>()
    const u = await Promise.all(
      Array.from({ length: 5000 }).map(async () => {
        {
          let email = faker.internet.email()

          while (emails.has(email)) {
            email = faker.internet.email()
          }
          emails.add(email)

          const u = { email, password: await hash(faker.internet.password(), SALT_ROUNDS), username: faker.internet.userName() }
          return u
        }
      })
    )
    u.unshift({ email: 'ved.rawat04@gmail.com', password: await hash('ved123', SALT_ROUNDS), username: 'VedSinghRawat' })

    const newUsers = await this.db.insert(users).values(u).returning()

    console.timeEnd('Users seeding')
    return newUsers
  }

  async projects(users: User[]) {
    console.log('Seeding projects')
    console.time('Projects seeding')
    const currProjs = await this.db.select().from(projects)

    if (currProjs.length) {
      const currProjUsers = await this.db
        .select()
        .from(projectUsers)
        .where(
          and(
            inArray(
              projectUsers.projectId,
              currProjs.map((proj) => proj.id)
            ),
            inArray(
              projectUsers.userId,
              users.map((user) => user.id)
            )
          )
        )

      console.log('Projects already seeded')
      console.timeEnd('Projects seeding')
      return { projects: currProjs, projectUsers: currProjUsers }
    }

    const user = faker.helpers.arrayElements(users, Math.floor(users.length * 0.3))

    const projs = await this.db
      .insert(projects)
      .values(
        user.map((user) => ({
          description: faker.lorem.paragraphs(2),
          title: faker.lorem.words(3),
          public: faker.datatype.boolean(),
          ownerId: user.id,
        }))
      )
      .returning()

    const projUsers = await this.db
      .insert(projectUsers)
      .values(
        projs.map((proj) => ({
          projectId: proj.id,
          userId: proj.ownerId,
          role: 'owner' as const,
        }))
      )
      .returning()

    console.timeEnd('Projects seeding')

    return { projects: projs, projectUsers: projUsers }
  }

  async projectUsers(projs: Project[], users: User[], projUs: ProjectUser[]) {
    console.log('Seeding project users')
    console.time('Project users seeding')

    const currProjUsers = await this.db.select().from(projectUsers)
    if (currProjUsers.length > projUs.length) {
      const userIdsToProjIds = currProjUsers.reduce(
        (acc, curr) => {
          acc[curr.projectId] = [...(acc[curr.projectId] || []), curr.userId]
          return acc
        },
        {} as Record<number, number[]>
      )

      console.log('Project Users pivot already seeded')
      console.timeEnd('Project users seeding')
      return userIdsToProjIds
    }

    const userIdsToProjIds = projUs.reduce(
      (acc, curr) => {
        acc[curr.projectId] = [...(acc[curr.projectId] || []), curr.userId]
        return acc
      },
      {} as Record<number, number[]>
    )

    const projUsEntries: (typeof projectUsers.$inferInsert)[] = []

    projs.forEach((proj) => {
      const numUsers = faker.number.int({ min: 12, max: 25 })
      const userIds = faker.helpers
        .arrayElements(users, numUsers)
        .filter((user) => !userIdsToProjIds[proj.id]!.includes(user.id))
        .map((user) => user.id)

      userIdsToProjIds[proj.id]!.push(...userIds)

      projUsEntries.push(
        ...userIds.map((userId) => ({
          projectId: proj.id,
          userId,
          role: Math.random() < 0.2 ? ('team_leader' as const) : ('member' as const),
        }))
      )
    })

    for (let i = 0; i < projUsEntries.length; i += 5000) {
      const batch = projUsEntries.slice(i, i + 5000)
      await this.db.insert(projectUsers).values(batch)
    }

    console.timeEnd('Project users seeding')

    return userIdsToProjIds
  }

  async tasks(projs: Project[]) {
    console.log('Seeding tasks')
    console.time('Tasks seeding')
    const currTasks = await this.db.select().from(tasks)
    if (currTasks.length) {
      console.log('Tasks already seeded')
      console.timeEnd('Tasks seeding')
      return currTasks
    }

    const ts: (typeof tasks.$inferInsert)[] = []

    projs.forEach((proj) => {
      const typeMap = {
        todo: 0,
        doing: 0,
        done: 0,
      }

      Array.from({ length: faker.number.int({ min: 10, max: 50 }) }, () => {
        const estimatedTime = faker.number.int({ min: 60 * 10, max: 60 * 60 * 10 })
        const timeLeft = faker.number.int({ min: 60 * 10, max: estimatedTime })
        const type = faker.helpers.arrayElement(['todo', 'doing', 'done'])
        const order = typeMap[type]++

        ts.push({
          projectId: proj.id,
          description: faker.lorem.paragraphs(2),
          overTime: timeLeft ? 0 : faker.number.int({ min: 60 * 10, max: 60 * 60 * 1.5 }),
          estimatedTime,
          timeLeft,
          order,
          type,
        })
      })
    })

    const newTasks: (typeof tasks.$inferSelect)[] = []
    for (let i = 0; i < ts.length; i += 5000) {
      const batch = ts.slice(i, i + 5000)
      const batchResult = await this.db.insert(tasks).values(batch).returning()
      newTasks.push(...batchResult)
    }

    console.timeEnd('Tasks seeding')

    return newTasks
  }

  async taskUsers(ts: Task[], userIdsToProjIds: Record<number, number[]>) {
    console.log('Seeding task users')
    console.time('Task users seeding')
    const currTaskUsers = await this.db.select().from(taskUsers)
    if (currTaskUsers.length) {
      console.log('Task users already seeded')
      console.timeEnd('Task users seeding')
      return currTaskUsers
    }

    const taskUserEntries: (typeof taskUsers.$inferInsert)[] = []

    ts.forEach((task) => {
      // Get project users for the task's project
      const projectUserIds = userIdsToProjIds[task.projectId]!

      // Randomly select 1-4 unique users for this task
      const numUsers = faker.number.int({ min: 1, max: 4 })
      const selectedUserIds = faker.helpers.arrayElements(projectUserIds, numUsers)

      selectedUserIds.forEach((userId) => {
        taskUserEntries.push({
          taskId: task.id,
          userId: userId,
        })
      })
    })

    const newTaskUsers: (typeof taskUsers.$inferSelect)[] = []
    for (let i = 0; i < taskUserEntries.length; i += 5000) {
      const batch = taskUserEntries.slice(i, i + 5000)
      const batchResult = await this.db.insert(taskUsers).values(batch).returning()
      newTaskUsers.push(...batchResult)
    }

    console.timeEnd('Task users seeding')

    return newTaskUsers
  }

  async seed() {
    console.log('Seeding')
    console.time('Seeding')
    const users = await this.users()
    const { projects, projectUsers } = await this.projects(users)
    const userIdsToProjIds = await this.projectUsers(projects, users, projectUsers)
    const tasks = await this.tasks(projects)
    await this.taskUsers(tasks, userIdsToProjIds)
    console.timeEnd('Seeding')
    console.log('Seeding done')
  }
}
