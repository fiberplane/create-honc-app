CREATE TABLE `pull_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`author_id` integer NOT NULL,
	`github_pr_id` integer,
	`github_repo_id` integer,
	`github_branch` text,
	`github_commit_sha` text,
	`github_repo_full_name` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pull_requests_github_pr_id_unique` ON `pull_requests` (`github_pr_id`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pull_request_id` integer NOT NULL,
	`reviewer_id` integer NOT NULL,
	`comments` text,
	`status` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`pull_request_id`) REFERENCES `pull_requests`(`github_pr_id`) ON UPDATE no action ON DELETE no action
);
