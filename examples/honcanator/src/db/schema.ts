import { jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export type NewGeese = typeof geese.$inferInsert;

export const geese = pgTable("geese", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
