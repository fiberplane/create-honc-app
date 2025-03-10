import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Specifications table to store the final generated specifications
export const specifications = sqliteTable("specifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  content: text("content").notNull(), // JSON string containing the full specification
  version: integer("version").notNull().default(1),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});
