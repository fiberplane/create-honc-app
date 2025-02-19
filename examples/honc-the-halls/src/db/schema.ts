import { jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export type NewMovieIdea = typeof movieIdeas.$inferInsert;

export const movieIdeas = pgTable("movie_ideas", {
  id: serial("id").primaryKey(),
  prompt: text("prompt"),
  response: text("response"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
