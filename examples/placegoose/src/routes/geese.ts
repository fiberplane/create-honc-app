import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { validator } from "hono/validator";

import * as schema from "../db/schema";
import { NotFoundError, ServiceError } from "../lib/errors";
import { validateIdParam } from "../lib/validation";
import type { Bindings, DrizzleClient } from "../types";

const geeseApp = new Hono<{ Bindings: Bindings }>();

// Get all Geese
geeseApp.get("/", async (c) => {
  const db = drizzle(c.env.DB);
  const geese = await db.select().from(schema.geese);

  return c.json(geese);
});

// Get Goose by specified id
geeseApp.get("/:id", validator("param", validateIdParam), async (c) => {
  const { id } = c.req.valid("param");

  const db = drizzle(c.env.DB);
  const gooseById = await getGooseById(db, id);

  if (!gooseById) {
    throw new NotFoundError(`No Geese with ID ${id}`);
  }

  return c.json(gooseById);
});

geeseApp.get("/:id/honks", validator("param", validateIdParam), async (c) => {
  const { id } = c.req.valid("param");

  const db = drizzle(c.env.DB);
  const gooseById = await getGooseById(db, id);

  if (!gooseById) {
    throw new NotFoundError(`No Geese with ID ${id}`);
  }

  const honksByGooseId = await db
    .select()
    .from(schema.honks)
    .where(eq(schema.honks.gooseId, id));

  return c.json(honksByGooseId);
});

export default geeseApp;

async function getGooseById(db: DrizzleClient, id: number) {
  const geeseById = await db
    .select()
    .from(schema.geese)
    .where(eq(schema.geese.id, id));

  if (geeseById.length > 1) {
    throw new ServiceError("Unique Constraint Conflict");
  }

  return geeseById.at(0);
}
