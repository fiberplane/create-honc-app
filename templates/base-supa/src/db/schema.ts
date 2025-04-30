import { jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export type NewUser = typeof users.$inferInsert;

export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	name: text("name"),
	email: text("email"),
	/**
	 * Settings included to demonstrate json columns. Don't forget
	 * to update the typing if you decide to use it! This is necessary
	 * for type compatability with Hono clients.
	 */
	settings: jsonb("settings").$type<Record<string, unknown>>(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
