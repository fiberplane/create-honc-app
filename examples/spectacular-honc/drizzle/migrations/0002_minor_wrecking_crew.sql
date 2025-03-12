PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_specifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text DEFAULT 'Untitled' NOT NULL,
	`content` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_specifications`("id", "title", "content", "version", "created_at", "updated_at") SELECT "id", "title", "content", "version", "created_at", "updated_at" FROM `specifications`;--> statement-breakpoint
DROP TABLE `specifications`;--> statement-breakpoint
ALTER TABLE `__new_specifications` RENAME TO `specifications`;--> statement-breakpoint
PRAGMA foreign_keys=ON;