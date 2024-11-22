import { eq } from "drizzle-orm";
import type { SQLiteColumn, SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";
import { HTTPException } from "hono/http-exception";

import * as schema from "../db/schema";
import type { DrizzleClient } from "../types";

type ColumnWithId = {
  id: SQLiteColumn;
}

type SQLiteTableWithIdColumn<T extends ColumnWithId> = SQLiteTableWithColumns<{
  name: string;
  schema: undefined;
  columns: T;
  dialect: "sqlite";
}>

async function getRowById<T extends ColumnWithId>(
  db: DrizzleClient, 
  table: SQLiteTableWithIdColumn<T>, 
  id: number
) {
  const rowsById = await db
    .select()
    .from(table)
    .where(eq(table.id, id))

  if (rowsById.length > 1) {
    new HTTPException(500, {
      message: "Unique Constraint Conflict",
    });
  }

  return rowsById.at(0);
}

export async function getGaggleById(db: DrizzleClient, id: number) {
  return getRowById(db, schema.gaggles, id)
}

export async function getGooseById(db: DrizzleClient, id: number) {
  return getRowById(db, schema.geese, id)
}

export async function getHonkById(db: DrizzleClient, id: number) {
  return getRowById(db, schema.honks, id)
}
