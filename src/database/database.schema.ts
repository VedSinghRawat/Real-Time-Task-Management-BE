import { InferSelectModel } from 'drizzle-orm'
import { bigint, bigserial, boolean, integer, pgEnum, pgTable, text, timestamp, unique, varchar } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  username: varchar('username', { length: 24 }).notNull(),
  email: varchar('email', { length: 320 }).notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
export type User = InferSelectModel<typeof users>

export const projects = pgTable(
  'projects',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    title: varchar('name', { length: 50 }).notNull(),
    description: text('description').notNull(),
    public: boolean('public').default(false).notNull(),
    ownerId: bigint('owner_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    projNameUniq: unique().on(table.title, table.ownerId),
  })
)

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
    orderTypeUniq: unique().on(table.order, table.type),
  })
)

export const roleEnum = pgEnum('role', ['team leader', 'member'])
export const projectUsers = pgTable(
  'project_users',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    projectId: bigint('project_id', { mode: 'number' })
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: roleEnum('role'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    projUserUniq: unique().on(table.projectId, table.userId),
  })
)

export const taskUsers = pgTable(
  'task_users',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    taskId: bigint('task_id', { mode: 'number' })
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    projectId: bigint('project_id', { mode: 'number' })
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userTaskUniq: unique().on(table.userId, table.taskId, table.projectId),
  })
)
