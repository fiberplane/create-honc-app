import {
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";

export type NewPullRequest = typeof pullRequests.$inferInsert;
export type NewReview = typeof reviews.$inferInsert;

export const pullRequests = pgTable("pull_requests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  authorId: integer("author_id").notNull(),
  githubPrId: integer("github_pr_id").unique(),
  githubRepoId: integer("github_repo_id"),
  githubBranch: text("github_branch"),
  githubCommitSha: text("github_commit_sha"),
  githubRepoFullName: text("github_repo_full_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  pullRequestId: integer("pull_request_id")
    .notNull()
    .references(() => pullRequests.githubPrId),
  reviewerId: integer("reviewer_id").notNull(),
  comments: text("comments"),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
