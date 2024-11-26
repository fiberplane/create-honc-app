import { type ColumnBaseConfig, eq, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type {
  SQLiteColumn,
  SQLiteTableWithColumns,
} from "drizzle-orm/sqlite-core";
import { HTTPException } from "hono/http-exception";
import * as schema from "../db/schema";

export async function getGaggleById(db: DrizzleClient, id: number) {
  return getRowById(db, schema.gaggles, id);
}

export async function getGooseById(db: DrizzleClient, id: number) {
  return getRowById(db, schema.geese, id);
}

export async function getHonkById(db: DrizzleClient, id: number) {
  return getRowById(db, schema.honks, id);
}

export async function getGaggleByIdExists(db: DrizzleClient, id: number) {
  return getRowByIdExists(db, schema.gaggles, id);
}

export async function getGooseByIdExists(db: DrizzleClient, id: number) {
  return getRowByIdExists(db, schema.geese, id);
}

export async function getHonkByIdExists(db: DrizzleClient, id: number) {
  return getRowByIdExists(db, schema.honks, id);
}

/**
 * Throws if multiple records found with same id
 * @returns Row data or undefined
 */
async function getRowById<T extends ColumnWithId>(
  db: DrizzleClient,
  table: SQLiteTableWithIdColumn<T>,
  id: number,
) {
  // todo: drizzle doesn't know that id needs to be a number here
  const rowsById = await db.select().from(table).where(eq(table.id, id));

  if (rowsById.length > 1) {
    new HTTPException(500, {
      message: "Unique Constraint Conflict",
    });
  }

  // todo: return null?
  return rowsById.at(0);
}

/**
 * Use subquery to verify row's existence by id.
 * Disregards possibility of id duplication
 * @returns boolean
 */
async function getRowByIdExists<T extends ColumnWithId>(
  db: DrizzleClient,
  table: SQLiteTableWithIdColumn<T>,
  id: number,
) {
  const rowExists = db.run(
    sql`select exists (select 1 from ${table} where ${table.id} = ${id})`,
  );

  return !!rowExists;
}

type DrizzleClient = DrizzleD1Database<typeof schema> & {
  $client: D1Database;
};

type ColumnWithId = {
  id: SQLiteColumn<ColumnBaseConfig<"number", "SQLiteInteger">>;
};

type SQLiteTableWithIdColumn<T extends ColumnWithId> = SQLiteTableWithColumns<{
  name: string;
  schema: undefined;
  columns: T;
  dialect: "sqlite";
}>;
