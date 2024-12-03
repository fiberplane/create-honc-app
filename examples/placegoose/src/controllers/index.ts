import { eq, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
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
async function getRowById<T extends PlacegooseTable>(
  db: DrizzleClient,
  table: T,
  id: number,
) {
  const rowsById = await db.select().from(table).where(eq(table.id, id));

  if (rowsById.length > 1) {
    new HTTPException(500, {
      message: "Unique Constraint Conflict",
    });
  }

  // todo: is returning null (if no result) clearer/more standard?
  return rowsById.at(0);
}

/**
 * Use subquery to verify row's existence by id.
 * Disregards possibility of id duplication
 * @returns boolean
 */
async function getRowByIdExists<T extends PlacegooseTable>(
  db: DrizzleClient,
  table: T,
  id: number,
) {
  const { rowExists } = await db.get<{ rowExists: boolean }>(
    sql`select exists (select 1 from ${table} where ${table.id} = ${id}) as rowExists`,
  );

  return !!rowExists;
}

type DrizzleClient = DrizzleD1Database<typeof schema> & {
  $client: D1Database;
};

/**
 * This is a fragile solution, but Drizzle typing is somewhat
 * challenging as soon as generics come into the picture
 */
type PlacegooseTable =
  | typeof schema.gaggles
  | typeof schema.geese
  | typeof schema.honks;
