import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Specifications table to store the final generated specifications
export const specifications = sqliteTable("specifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull().default("Untitled"),
  content: text("content").notNull(), // markdown content, we hope
  version: integer("version").notNull().default(1),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type Specification = typeof specifications.$inferSelect;
