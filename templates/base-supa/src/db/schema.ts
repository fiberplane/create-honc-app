import { jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export type NewUser = typeof users.$inferInsert;

export const users = pgTable("users", {
	id: serial().primaryKey(),
	name: text(),
	email: text(),
	/**
	 * Settings included to demonstrate json columns. Don't forget
	 * to update the typing if you decide to use it! This is necessary
	 * for type compatability with Hono clients.
	 */
	settings: jsonb().$type<Record<string, unknown>>(),
	createdAt: timestamp().defaultNow().notNull(),
	updatedAt: timestamp().defaultNow().notNull(),
});
