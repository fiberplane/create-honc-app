import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export type Gaggle = typeof gaggles.$inferSelect;

export const gaggles = sqliteTable("gaggles", {
    id: integer("id", { mode: "number" }).primaryKey(),
    name: text("name").notNull(),
});

export type Goose = typeof gaggles.$inferSelect;

export const geese = sqliteTable("geese", {
    id: integer("id", { mode: "number" }).primaryKey(),
    gaggleId: integer("gaggle_id").references(() => gaggles.id),
    name: text("name").notNull(),
});

export type Honk = typeof honks.$inferSelect;

export const honks = sqliteTable("honks", {
    id: integer("id", { mode: "number" }).primaryKey(),
    gooseId: integer("goose_id").references(() => geese.id),
});
