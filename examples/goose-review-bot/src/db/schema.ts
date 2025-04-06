import {
  integer,
  sqliteTable,
  text,
  primaryKey,
} from "drizzle-orm/sqlite-core";

export type NewPullRequest = typeof pullRequests.$inferInsert;
export type NewReview = typeof reviews.$inferInsert;

export const pullRequests = sqliteTable("pull_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  authorId: integer("author_id").notNull(),
  githubPrId: integer("github_pr_id").unique(),
  githubRepoId: integer("github_repo_id"),
  githubBranch: text("github_branch"),
  githubCommitSha: text("github_commit_sha"),
  githubRepoFullName: text("github_repo_full_name"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pullRequestId: integer("pull_request_id")
    .notNull()
    .references(() => pullRequests.githubPrId),
  reviewerId: integer("reviewer_id").notNull(),
  comments: text("comments"),
  status: text("status").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
