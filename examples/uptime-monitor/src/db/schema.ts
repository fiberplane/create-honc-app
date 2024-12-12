import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export type Website = typeof websites.$inferSelect;
export type NewWebsite = typeof websites.$inferInsert;
export type NewUptimeCheck = typeof uptimeChecks.$inferInsert;

export const websites = sqliteTable("websites", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  url: text("url").notNull(),
  name: text("name").notNull(),
  checkInterval: integer("checkInterval").notNull(),
  createdAt: text("createdAt").notNull(),
});

export const uptimeChecks = sqliteTable("uptime_checks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  websiteId: integer("websiteId")
    .notNull()
    .references(() => websites.id),
  timestamp: text("timestamp").notNull(),
  status: integer("status"),
  responseTime: integer("responseTime"),
  isUp: integer("isUp", { mode: "boolean" }).notNull(),
});
