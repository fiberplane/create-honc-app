import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export type NewUser = typeof users.$inferInsert;

export const users = pgTable("users", {
  // NOTE - We use a random UUID here, instead of a `serial`, because at the time of writing,
  //        drizzle-seed messes with the auto-incrementing ID in Neon. not sure why yet.
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
