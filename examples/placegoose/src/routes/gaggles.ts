import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { validator } from "hono/validator";
import { z } from "zod";

import * as schema from "../db/schema";
import { NotFoundError, ServiceError } from "../lib/errors";
import { makeBodyValidator, validateIdParam } from "../lib/validation";
import type { Bindings, DrizzleClient } from "../types";
import { generateId } from "../utils";

const ZGaggleInsert = z.object({
  name: z.string().min(1),
  territory: z.string().min(1).nullable(),
});

const gagglesApp = new Hono<{ Bindings: Bindings }>();

// Get all Gaggles
gagglesApp.get("/", async (c) => {
  const db = drizzle(c.env.DB);
  const gaggles = await db.select().from(schema.gaggles);

  return c.json(gaggles);
});

// Create a new Gaggle
gagglesApp.post(
  "/",
  validator("json", makeBodyValidator(ZGaggleInsert)),
  async (c) => {
    const gaggleData = c.req.valid("json");

    const newGaggle: schema.Gaggle = {
      id: generateId(),
      ...gaggleData,
    };

    return c.json(newGaggle);
  },
);

// Get a specific Gaggle by id
gagglesApp.get("/:id", validator("param", validateIdParam), async (c) => {
  const { id } = c.req.valid("param");

  const db = drizzle(c.env.DB);
  const gaggleById = await getGaggleById(db, id);

  if (!gaggleById) {
    throw new NotFoundError(`No Gaggle with ID ${id}`);
  }

  return c.json(gaggleById);
});

// Get Geese in the Gaggle specified by id
gagglesApp.get("/:id/geese", validator("param", validateIdParam), async (c) => {
  const { id } = c.req.valid("param");

  const db = drizzle(c.env.DB);
  const gaggleById = await getGaggleById(db, id);

  if (!gaggleById) {
    throw new NotFoundError(`No Gaggle with ID ${id}`);
  }

  const geeseByGaggleId = await db
    .select()
    .from(schema.geese)
    .where(eq(schema.geese.gaggleId, id));

  return c.json(geeseByGaggleId);
});

// Update Gaggle specified by id
gagglesApp.put(
  "/:id",
  validator("param", validateIdParam),
  validator("json", makeBodyValidator(ZGaggleInsert)),
  async (c) => {
    const { id } = c.req.valid("param");
    const gaggleData = c.req.valid("json");

    const db = drizzle(c.env.DB);
    const gaggleById = await getGaggleById(db, id);

    if (!gaggleById) {
      throw new NotFoundError( `No Gaggle with ID ${id}`);
    }

    const updatedGaggle: schema.Gaggle = {
      ...gaggleById,
      ...gaggleData,
    };

    return c.json(updatedGaggle);
  },
);

// Delete Gaggle specified by id
gagglesApp.delete("/:id", validator("param", validateIdParam), async (c) => {
  const { id } = c.req.valid("param");

  const db = drizzle(c.env.DB);
  const gaggleById = await getGaggleById(db, id);

  if (!gaggleById) {
    throw new NotFoundError( `No Gaggle with ID ${id}`);
  }

  return c.body(null, 204);
});

export default gagglesApp;

async function getGaggleById(db: DrizzleClient, id: number) {
  const gagglesById = await db
    .select()
    .from(schema.gaggles)
    .where(eq(schema.gaggles.id, id));

  if (gagglesById.length > 1) {
    throw new ServiceError("Unique Constraint Conflict");
  }

  return gagglesById.at(0);
}
