import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { validator } from "hono/validator";

import { getGooseById } from "../controllers";
import { getDb } from "../db";
import * as schema from "../db/schema";
import { validateIdParam } from "../lib/validation";
import type { DatabaseBindings } from "../types";

const geeseApp = new Hono<{ Bindings: DatabaseBindings }>();

// Get all Geese
geeseApp.get("/", async (c) => {
  const db = getDb(c.env.DB);
  const geese = await db.select().from(schema.geese);

  return c.json(geese);
});

// Get Goose by specified id
geeseApp.get("/:id", validator("param", validateIdParam), async (c) => {
  const { id } = c.req.valid("param");

  const db = getDb(c.env.DB);
  const gooseById = await getGooseById(db, id);

  if (!gooseById) {
    throw new HTTPException(404, {
      message: `No Geese with ID ${id}`,
    });
  }

  return c.json(gooseById);
});

// Get Honks made by Goose specified by id
geeseApp.get("/:id/honks", validator("param", validateIdParam), async (c) => {
  const { id } = c.req.valid("param");

  const db = getDb(c.env.DB);
  const gooseById = await getGooseById(db, id);

  if (!gooseById) {
    throw new HTTPException(404, {
      message: `No Geese with ID ${id}`,
    });
  }

  const honksByGooseId = await db
    .select()
    .from(schema.honks)
    .where(eq(schema.honks.gooseId, id));

  return c.json(honksByGooseId);
});

export default geeseApp;
