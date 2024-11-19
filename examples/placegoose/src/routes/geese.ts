import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { type Context, Hono } from "hono";

import * as schema from "../db/schema";
import { KnownError, NotFoundError } from "../lib/errors";
import type { Bindings } from "../types";
import { parseId } from "../utils";

const geeseApp = new Hono<{ Bindings: Bindings }>();

// Get all Geese
geeseApp.get("/", async (c) => {
  const db = drizzle(c.env.DB);
  const geese = await db.select().from(schema.geese);

  return c.json(geese);
});

// Get Goose by specified id
geeseApp.get("/:id", async (c) => {
  const id = parseId(c.req.param("id"));

  const gooseById = await getGooseById(c, id);

  if (!gooseById) {
    throw new NotFoundError();
  }

  return c.json(gooseById);
});

geeseApp.get("/:id/honks", async (c) => {
  const id = parseId(c.req.param("id"));

  const gooseById = await getGooseById(c, id);

  if (!gooseById) {
    throw new NotFoundError();
  }

  const db = drizzle(c.env.DB);
  const honksByGooseId = await db
    .select()
    .from(schema.honks)
    .where(eq(schema.honks.gooseId, id));

  return c.json(honksByGooseId);
});

export default geeseApp;

async function getGooseById(c: Context, id: number) {
  const db = drizzle(c.env.DB);
  const geeseById = await db
    .select()
    .from(schema.geese)
    .where(eq(schema.geese.id, id));

  if (geeseById.length > 1) {
    throw new KnownError("Unique Constraint Conflict");
  }

  return geeseById.at(0);
}
