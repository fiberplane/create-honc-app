import { type SQL, sql } from "drizzle-orm";
import {
  type AnySQLiteColumn,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const currentTimestamp = () => {
  return sql`(CURRENT_TIMESTAMP)`;
};

const lower = (email: AnySQLiteColumn): SQL => {
  return sql`lower(${email})`;
};

export type NewUser = typeof users.$inferInsert;

export const users = sqliteTable(
  "users",
  {
    // .primaryKey() must be chained before $defaultFn
    id: text()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text().notNull(),
    email: text().notNull(),
    createdAt: text().notNull().default(currentTimestamp()),
    updatedAt: text().notNull().default(currentTimestamp()),
  },
  /**
   * Ensure case-insensitive uniqueness for email
   * @see https://orm.drizzle.team/docs/guides/unique-case-insensitive-email#sqlite
   */
  (table) => [uniqueIndex("emailUniqueIndex").on(lower(table.email))],
);
