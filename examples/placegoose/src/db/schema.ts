import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const metadata = {
  id: integer({ mode: "number" }).primaryKey(),
}

export type Gaggle = typeof gaggles.$inferSelect;
export const gaggles = sqliteTable("gaggles", {
  ...metadata,
  name: text().notNull(),
  territory: text(),
});

export type Goose = typeof geese.$inferSelect;
export const geese = sqliteTable("geese", {
    ...metadata,
  gaggleId: integer({ mode: "number" }).references(() => gaggles.id),
  name: text().notNull(),
  isMigratory: integer({ mode: "boolean" }).notNull().default(true),
  mood: text({
    enum: ["hangry", "waddling", "stoic", "haughty", "alarmed"],
  }),
});

export type Honk = typeof honks.$inferSelect;
export const honks = sqliteTable("honks", {
    ...metadata,
  gooseId: integer()
    .references(() => geese.id)
    .notNull(),
  decibels: integer().notNull(),
});
