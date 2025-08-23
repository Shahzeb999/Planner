CREATE TABLE `mocks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`week` integer NOT NULL,
	`mock_type` text NOT NULL,
	`goal` text NOT NULL,
	`notes` text,
	`scheduled_at` integer,
	`outcome` text,
	`feedback` text,
	`score` integer,
	`duration` integer,
	`interviewer` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE INDEX `mocks_week_idx` ON `mocks` (`week`);--> statement-breakpoint
CREATE INDEX `mocks_scheduled_at_idx` ON `mocks` (`scheduled_at`);--> statement-breakpoint
CREATE INDEX `mocks_outcome_idx` ON `mocks` (`outcome`);--> statement-breakpoint
CREATE TABLE `oop_problems` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`week` integer NOT NULL,
	`track` text NOT NULL,
	`name` text NOT NULL,
	`difficulty` text NOT NULL,
	`url` text,
	`notes` text,
	`status` text DEFAULT 'todo' NOT NULL,
	`time_spent_mins` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE INDEX `oop_problems_week_idx` ON `oop_problems` (`week`);--> statement-breakpoint
CREATE INDEX `oop_problems_track_idx` ON `oop_problems` (`track`);--> statement-breakpoint
CREATE INDEX `oop_problems_status_idx` ON `oop_problems` (`status`);--> statement-breakpoint
CREATE INDEX `oop_problems_difficulty_idx` ON `oop_problems` (`difficulty`);--> statement-breakpoint
CREATE TABLE `plan_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`week` integer NOT NULL,
	`week_range` text,
	`day_name` text NOT NULL,
	`phase` text,
	`theme` text NOT NULL,
	`task_type` text NOT NULL,
	`task_desc` text NOT NULL,
	`weekly_challenge` text,
	`resource_pointer` text,
	`status` text DEFAULT 'todo' NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE INDEX `date_idx` ON `plan_items` (`date`);--> statement-breakpoint
CREATE INDEX `week_idx` ON `plan_items` (`week`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `plan_items` (`status`);--> statement-breakpoint
CREATE INDEX `task_type_idx` ON `plan_items` (`task_type`);--> statement-breakpoint
CREATE TABLE `playbook_checklists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`playbook_name` text NOT NULL,
	`checklist_item` text NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE INDEX `playbook_checklists_playbook_idx` ON `playbook_checklists` (`playbook_name`);--> statement-breakpoint
CREATE INDEX `playbook_checklists_completed_idx` ON `playbook_checklists` (`completed`);--> statement-breakpoint
CREATE TABLE `problems` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`week` integer NOT NULL,
	`category` text NOT NULL,
	`name` text NOT NULL,
	`difficulty` text NOT NULL,
	`url` text,
	`notes` text,
	`status` text DEFAULT 'todo' NOT NULL,
	`time_spent_mins` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE INDEX `problems_week_idx` ON `problems` (`week`);--> statement-breakpoint
CREATE INDEX `problems_category_idx` ON `problems` (`category`);--> statement-breakpoint
CREATE INDEX `problems_status_idx` ON `problems` (`status`);--> statement-breakpoint
CREATE INDEX `problems_difficulty_idx` ON `problems` (`difficulty`);--> statement-breakpoint
CREATE TABLE `resources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`week` integer NOT NULL,
	`area` text NOT NULL,
	`title` text NOT NULL,
	`url` text,
	`notes` text,
	`pinned` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE INDEX `resources_week_idx` ON `resources` (`week`);--> statement-breakpoint
CREATE INDEX `resources_area_idx` ON `resources` (`area`);--> statement-breakpoint
CREATE INDEX `resources_pinned_idx` ON `resources` (`pinned`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`kind` text NOT NULL,
	`duration_mins` integer NOT NULL,
	`notes` text,
	`linked_plan_item_id` integer,
	`linked_problem_id` integer,
	`linked_oop_problem_id` integer,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`linked_plan_item_id`) REFERENCES `plan_items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`linked_problem_id`) REFERENCES `problems`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`linked_oop_problem_id`) REFERENCES `oop_problems`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `sessions_date_idx` ON `sessions` (`date`);--> statement-breakpoint
CREATE INDEX `sessions_kind_idx` ON `sessions` (`kind`);--> statement-breakpoint
CREATE INDEX `sessions_linked_plan_item_idx` ON `sessions` (`linked_plan_item_id`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
