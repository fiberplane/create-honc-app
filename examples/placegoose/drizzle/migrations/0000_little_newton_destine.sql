CREATE TABLE `gaggles` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`territory` text
);
--> statement-breakpoint
CREATE TABLE `geese` (
	`id` integer PRIMARY KEY NOT NULL,
	`gaggle_id` integer,
	`name` text NOT NULL,
	`is_migratory` integer DEFAULT true NOT NULL,
	`mood` text,
	FOREIGN KEY (`gaggle_id`) REFERENCES `gaggles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `honks` (
	`id` integer PRIMARY KEY NOT NULL,
	`goose_id` integer NOT NULL,
	`decibels` integer NOT NULL,
	FOREIGN KEY (`goose_id`) REFERENCES `geese`(`id`) ON UPDATE no action ON DELETE no action
);
