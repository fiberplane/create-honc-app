import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export type Gaggle = typeof gaggles.$inferSelect;

export const gaggles = sqliteTable("gaggles", {
  id: integer({ mode: "number" }).primaryKey(),
  name: text().notNull(),
  territory: text(),
});

export type Goose = typeof geese.$inferSelect;

export const geese = sqliteTable("geese", {
  id: integer({ mode: "number" }).primaryKey(),
  gaggleId: integer({ mode: "number" }).references(() => gaggles.id),
  name: text().notNull(),
  isMigratory: integer({ mode: "boolean" }).notNull().default(true),
  mood: text({
    enum: ["hangry", "waddling", "stoic", "haughty", "alarmed"],
  }),
});

export type Honk = typeof honks.$inferSelect;

export const honks = sqliteTable("honks", {
  id: integer({ mode: "number" }).primaryKey(),
  gooseId: integer()
    .references(() => geese.id)
    .notNull(),
  decibels: integer().notNull(),
});
