import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export type NewUser = typeof users.$inferInsert;

export const users = sqliteTable("users", {
	id: integer({ mode: "number" }).primaryKey(),
	name: text().notNull(),
	email: text().notNull(),
	createdAt: text().notNull().default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text().notNull().default(sql`(CURRENT_TIMESTAMP)`),
});
