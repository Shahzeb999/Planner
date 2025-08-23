import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';

// Enums for type safety
export const statusEnum = ['todo', 'in_progress', 'done'] as const;
export const problemStatusEnum = ['todo', 'solved', 'skipped'] as const;
export const difficultyEnum = ['Easy', 'Medium', 'Hard'] as const;
export const sessionKindEnum = ['study', 'drill', 'build', 'eval', 'mock', 'challenge'] as const;
export const mockOutcomeEnum = ['pass', 'borderline', 'fail'] as const;

// Plan items table
export const planItems = sqliteTable(
  'plan_items',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    date: text('date').notNull(), // ISO date string (YYYY-MM-DD)
    week: integer('week').notNull(),
    weekRange: text('week_range'),
    dayName: text('day_name').notNull(),
    phase: text('phase'),
    theme: text('theme').notNull(), // Week Focus
    taskType: text('task_type').notNull(),
    taskDesc: text('task_desc').notNull(),
    weeklyChallenge: text('weekly_challenge'), // Sat challenge
    resourcePointer: text('resource_pointer'),
    status: text('status', { enum: statusEnum }).notNull().default('todo'),
    notes: text('notes'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    dateIdx: index('date_idx').on(table.date),
    weekIdx: index('week_idx').on(table.week),
    statusIdx: index('status_idx').on(table.status),
    taskTypeIdx: index('task_type_idx').on(table.taskType),
  })
);

// Weekly problem sets table
export const problems = sqliteTable(
  'problems',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    week: integer('week').notNull(),
    category: text('category').notNull(), // Topic
    name: text('name').notNull(),
    difficulty: text('difficulty', { enum: difficultyEnum }).notNull(),
    url: text('url'),
    notes: text('notes'),
    status: text('status', { enum: problemStatusEnum }).notNull().default('todo'),
    timeSpentMins: integer('time_spent_mins').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    weekIdx: index('problems_week_idx').on(table.week),
    categoryIdx: index('problems_category_idx').on(table.category),
    statusIdx: index('problems_status_idx').on(table.status),
    difficultyIdx: index('problems_difficulty_idx').on(table.difficulty),
  })
);

// OOP problem sets table
export const oopProblems = sqliteTable(
  'oop_problems',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    week: integer('week').notNull(),
    track: text('track').notNull(),
    name: text('name').notNull(),
    difficulty: text('difficulty', { enum: difficultyEnum }).notNull(),
    url: text('url'),
    notes: text('notes'),
    status: text('status', { enum: problemStatusEnum }).notNull().default('todo'),
    timeSpentMins: integer('time_spent_mins').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    weekIdx: index('oop_problems_week_idx').on(table.week),
    trackIdx: index('oop_problems_track_idx').on(table.track),
    statusIdx: index('oop_problems_status_idx').on(table.status),
    difficultyIdx: index('oop_problems_difficulty_idx').on(table.difficulty),
  })
);

// Resources table
export const resources = sqliteTable(
  'resources',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    week: integer('week').notNull(),
    area: text('area').notNull(),
    title: text('title').notNull(),
    url: text('url'),
    notes: text('notes'),
    pinned: integer('pinned', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    weekIdx: index('resources_week_idx').on(table.week),
    areaIdx: index('resources_area_idx').on(table.area),
    pinnedIdx: index('resources_pinned_idx').on(table.pinned),
  })
);

// Mocks table
export const mocks = sqliteTable(
  'mocks',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    week: integer('week').notNull(),
    mockType: text('mock_type').notNull(),
    goal: text('goal').notNull(),
    notes: text('notes'),
    scheduledAt: integer('scheduled_at', { mode: 'timestamp' }),
    outcome: text('outcome', { enum: mockOutcomeEnum }),
    feedback: text('feedback'),
    score: integer('score'), // 1-5 rating
    duration: integer('duration'), // minutes
    interviewer: text('interviewer'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    weekIdx: index('mocks_week_idx').on(table.week),
    scheduledAtIdx: index('mocks_scheduled_at_idx').on(table.scheduledAt),
    outcomeIdx: index('mocks_outcome_idx').on(table.outcome),
  })
);

// Sessions table for time tracking
export const sessions = sqliteTable(
  'sessions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    date: text('date').notNull(), // ISO date string
    kind: text('kind', { enum: sessionKindEnum }).notNull(),
    durationMins: integer('duration_mins').notNull(),
    notes: text('notes'),
    linkedPlanItemId: integer('linked_plan_item_id').references(() => planItems.id),
    linkedProblemId: integer('linked_problem_id').references(() => problems.id),
    linkedOopProblemId: integer('linked_oop_problem_id').references(() => oopProblems.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    dateIdx: index('sessions_date_idx').on(table.date),
    kindIdx: index('sessions_kind_idx').on(table.kind),
    linkedPlanItemIdx: index('sessions_linked_plan_item_idx').on(table.linkedPlanItemId),
  })
);

// Settings table for app configuration
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// Playbook checklists table for tracking progress in playbooks
export const playbookChecklists = sqliteTable(
  'playbook_checklists',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    playbookName: text('playbook_name').notNull(),
    checklistItem: text('checklist_item').notNull(),
    completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => ({
    playbookIdx: index('playbook_checklists_playbook_idx').on(table.playbookName),
    completedIdx: index('playbook_checklists_completed_idx').on(table.completed),
  })
);

// Type exports for TypeScript
export type PlanItem = typeof planItems.$inferSelect;
export type NewPlanItem = typeof planItems.$inferInsert;
export type Problem = typeof problems.$inferSelect;
export type NewProblem = typeof problems.$inferInsert;
export type OopProblem = typeof oopProblems.$inferSelect;
export type NewOopProblem = typeof oopProblems.$inferInsert;
export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;
export type Mock = typeof mocks.$inferSelect;
export type NewMock = typeof mocks.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
export type PlaybookChecklist = typeof playbookChecklists.$inferSelect;
export type NewPlaybookChecklist = typeof playbookChecklists.$inferInsert;

