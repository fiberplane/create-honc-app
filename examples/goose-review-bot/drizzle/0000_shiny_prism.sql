CREATE TABLE IF NOT EXISTS "pull_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"author_id" integer NOT NULL,
	"github_pr_id" integer,
	"github_repo_id" integer,
	"github_branch" text,
	"github_commit_sha" text,
	"github_repo_full_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pull_requests_github_pr_id_unique" UNIQUE("github_pr_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"pull_request_id" integer NOT NULL,
	"reviewer_id" integer NOT NULL,
	"comments" text,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviews" ADD CONSTRAINT "reviews_pull_request_id_pull_requests_github_pr_id_fk" FOREIGN KEY ("pull_request_id") REFERENCES "public"."pull_requests"("github_pr_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
