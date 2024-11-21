import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

import * as schema from "../db/schema";
import type { DrizzleClient } from "../types";

// todo: is all this necessary just to check if a record exists?

export async function getGaggleById(db: DrizzleClient, id: number) {
  const gagglesById = await db
    .select()
    .from(schema.gaggles)
    .where(eq(schema.gaggles.id, id));

  if (gagglesById.length > 1) {
    new HTTPException(500, {
      message: "Unique Constraint Conflict",
    });
  }

  return gagglesById.at(0);
}

export async function getGooseById(db: DrizzleClient, id: number) {
  const geeseById = await db
    .select()
    .from(schema.geese)
    .where(eq(schema.geese.id, id));

  if (geeseById.length > 1) {
    new HTTPException(500, {
      message: "Unique Constraint Conflict",
    });
  }

  return geeseById.at(0);
}

export async function getHonkById(db: DrizzleClient, id: number) {
  const honksById = await db
    .select()
    .from(schema.honks)
    .where(eq(schema.honks.id, id));

  if (honksById.length > 1) {
    throw new HTTPException(500, {
      message: "Unique Constraint Conflict",
    });
  }

  return honksById.at(0);
}
