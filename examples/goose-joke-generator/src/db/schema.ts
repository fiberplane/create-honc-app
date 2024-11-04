import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const jokes = pgTable("jokes", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
