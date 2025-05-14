import { type SQL, sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const lower = (email: AnyPgColumn): SQL => {
  return sql`lower(${email})`;
};

export type NewUser = typeof users.$inferInsert;

export const users = pgTable(
  "users",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    email: text().notNull(),
    /**
     * Settings included to demonstrate json columns. Don't forget
     * to update the typing if you decide to use it! This is necessary
     * for type compatability with Hono clients.
     */
    settings: jsonb().$type<Record<string, unknown>>(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
  },
  /**
   * Ensure case-insensitive uniqueness for email
   * @see https://orm.drizzle.team/docs/guides/unique-case-insensitive-email#postgresql
   */
  (table) => [uniqueIndex("emailUniqueIndex").on(lower(table.email))],
);
