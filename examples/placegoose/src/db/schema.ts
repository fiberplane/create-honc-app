import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export type Gaggle = typeof gaggles.$inferSelect;

export const gaggles = sqliteTable("gaggles", {
    id: integer("id", { mode: "number" }).primaryKey(),
    name: text("name").notNull(),
    territory: text("territory"),
});

export type Goose = typeof geese.$inferSelect;

export const geese = sqliteTable("geese", {
    id: integer("id", { mode: "number" }).primaryKey(),
    gaggleId: integer("gaggle_id", { mode: "number" }).references(() => gaggles.id),
    name: text("name").notNull(),
    isMigratory: integer("is_migratory", { mode: "boolean" }).notNull().default(true),
    mood: text("mood", { enum: ["hangry", "waddling", "stoic", "haughty", "alarmed"] })
});

export type Honk = typeof honks.$inferSelect;

export const honks = sqliteTable("honks", {
    id: integer("id", { mode: "number" }).primaryKey(),
    gooseId: integer("goose_id").references(() => geese.id).notNull(),
    decibels: integer("decibels").notNull(),
});
