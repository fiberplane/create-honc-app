CREATE TABLE `uptime_checks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`websiteId` integer NOT NULL,
	`timestamp` text NOT NULL,
	`status` integer,
	`responseTime` integer,
	`isUp` integer NOT NULL,
	FOREIGN KEY (`websiteId`) REFERENCES `websites`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `websites` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`url` text NOT NULL,
	`name` text NOT NULL,
	`checkInterval` integer NOT NULL,
	`createdAt` text NOT NULL
);
