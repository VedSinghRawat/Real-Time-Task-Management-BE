import { relations } from 'drizzle-orm'
import { bigint, bigserial, boolean, integer, pgEnum, pgTable, primaryKey, text, timestamp, unique, uuid, varchar } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  username: varchar('username', { length: 64 }).notNull(),
  email: varchar('email', { length: 320 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
export type User = typeof users.$inferSelect

export const userRelations = relations(users, ({ many }) => ({
  projectUsers: many(projectUsers),
  taskUsers: many(taskUsers),
}))

export const projects = pgTable('projects', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  title: varchar('title', { length: 50 }).notNull(),
  description: text('description').notNull(),
  image: varchar('image', { length: 255 }),
  public: boolean('public').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
export type Project = typeof projects.$inferSelect

export const projectRelations = relations(projects, ({ many }) => ({
  projectUsers: many(projectUsers),
}))

export const roleEnum = pgEnum('role', ['team_leader', 'member', 'owner'])
export const projectUsers = pgTable(
  'project_users',
  {
    projectId: bigint('project_id', { mode: 'number' })
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: roleEnum('role').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.projectId, table.userId] }),
  })
)
export type ProjectUser = typeof projectUsers.$inferSelect

export const projectUserRelations = relations(projectUsers, ({ one }) => ({
  project: one(projects, {
    fields: [projectUsers.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectUsers.userId],
    references: [users.id],
  }),
}))

export const taskTypeEnum = pgEnum('task_type', ['todo', 'doing', 'done'])
export const tasks = pgTable(
  'tasks',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    projectId: bigint('project_id', { mode: 'number' })
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    description: text('description').notNull(),
    estimatedTime: integer('estimated_time').notNull(),
    timeLeft: integer('time_left').notNull(),
    overTime: integer('over_time').notNull().default(0),
    type: taskTypeEnum('type').notNull().default('todo'),
    order: integer('order').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orderTypeUniq: unique().on(table.order, table.type, table.projectId),
  })
)
export type Task = typeof tasks.$inferSelect

export const taskRelations = relations(tasks, ({ one }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
}))

export const taskUsers = pgTable(
  'task_users',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    taskId: bigint('task_id', { mode: 'number' })
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userTaskUniq: unique().on(table.userId, table.taskId),
  })
)
export type TaskUser = typeof taskUsers.$inferSelect

export const taskUserRelations = relations(taskUsers, ({ one }) => ({
  task: one(tasks, {
    fields: [taskUsers.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [taskUsers.userId],
    references: [users.id],
  }),
}))
