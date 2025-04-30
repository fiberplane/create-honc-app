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
		id: text().$defaultFn(crypto.randomUUID).primaryKey(),
		name: text().notNull(),
		email: text().notNull(),
		createdAt: text().notNull().default(currentTimestamp()),
		updatedAt: text().notNull().default(currentTimestamp()),
	},
	(table) => [uniqueIndex("emailUniqueIndex").on(lower(table.email))],
);
