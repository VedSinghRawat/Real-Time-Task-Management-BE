import { bigint, bigserial, integer, pgEnum, pgTable, text, timestamp, unique, uuid, varchar } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  username: varchar('username', { length: 24 }).notNull().unique(),
  email: varchar('email', { length: 320 }).notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const projects = pgTable(
  'projects',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: varchar('name', { length: 50 }).notNull(),
    ownerId: bigint('owner_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    projNameUniq: unique().on(table.name, table.ownerId),
  })
)

export const typeEnum = pgEnum('type', ['todo', 'doing', 'done'])
export const tasks = pgTable(
  'tasks',
  {
    uuid: uuid('uuid').defaultRandom().primaryKey(),
    projectId: bigint('project_id', { mode: 'number' })
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    description: text('description').notNull(),
    estimatedTime: integer('estimated_time').notNull(),
    timeLeft: integer('time_left').notNull(),
    overTime: integer('over_time').notNull().default(0),
    type: typeEnum('type').notNull().default('todo'),
    order: integer('order').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    orderTypeUniq: unique().on(table.order, table.type),
  })
)

export const roleEnum = pgEnum('role', ['manager', 'worker'])
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
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
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
    taskUUID: uuid('task_uuid')
      .notNull()
      .references(() => tasks.uuid, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userTaskUniq: unique().on(table.userId, table.taskUUID),
  })
)
