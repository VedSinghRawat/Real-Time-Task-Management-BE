import { bigint, bigserial, boolean, integer, pgEnum, pgTable, serial, text, timestamp, unique, uuid, varchar } from 'drizzle-orm/pg-core'

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
    uuid: uuid('uuid').defaultRandom().primaryKey(),
    name: varchar('name', { length: 50 }).notNull(),
    public: boolean('public').default(false),
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
    id: serial('id').primaryKey(),
    projectUUID: varchar('project_uuid')
      .notNull()
      .references(() => projects.uuid, { onDelete: 'cascade' }),
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

export const roleEnum = pgEnum('role', ['team leader', 'member'])
export const projectUsers = pgTable(
  'project_users',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    projectUUID: varchar('project_uuid')
      .notNull()
      .references(() => projects.uuid, { onDelete: 'cascade' }),
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: roleEnum('role'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    projUserUniq: unique().on(table.projectUUID, table.userId),
  })
)

export const taskUsers = pgTable(
  'task_users',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    taskId: uuid('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    projectUUID: varchar('project_uuid')
      .notNull()
      .references(() => projects.uuid, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userTaskUniq: unique().on(table.userId, table.taskId, table.projectUUID),
  })
)
