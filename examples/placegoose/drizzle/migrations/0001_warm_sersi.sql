PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_gaggles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`territory` text
);
--> statement-breakpoint
INSERT INTO `__new_gaggles`("id", "name", "territory") SELECT "id", "name", "territory" FROM `gaggles`;--> statement-breakpoint
DROP TABLE `gaggles`;--> statement-breakpoint
ALTER TABLE `__new_gaggles` RENAME TO `gaggles`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_geese` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`gaggle_id` integer,
	`name` text NOT NULL,
	`is_migratory` integer DEFAULT true NOT NULL,
	`mood` text,
	FOREIGN KEY (`gaggle_id`) REFERENCES `gaggles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_geese`("id", "gaggle_id", "name", "is_migratory", "mood") SELECT "id", "gaggle_id", "name", "is_migratory", "mood" FROM `geese`;--> statement-breakpoint
DROP TABLE `geese`;--> statement-breakpoint
ALTER TABLE `__new_geese` RENAME TO `geese`;--> statement-breakpoint
CREATE TABLE `__new_honks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`goose_id` integer NOT NULL,
	`decibels` integer NOT NULL,
	FOREIGN KEY (`goose_id`) REFERENCES `geese`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_honks`("id", "goose_id", "decibels") SELECT "id", "goose_id", "decibels" FROM `honks`;--> statement-breakpoint
DROP TABLE `honks`;--> statement-breakpoint
ALTER TABLE `__new_honks` RENAME TO `honks`;