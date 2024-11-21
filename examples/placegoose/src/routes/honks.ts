import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { validator } from "hono/validator";
import { z } from "zod";

import * as schema from "../db/schema";
import { ServiceError } from "../lib/errors";
import {
  makeBodyValidator,
  validateId,
  validateIdParam,
} from "../lib/validation";
import type { DatabaseBindings, DrizzleClient } from "../types";
import { generateId } from "../utils";

const ZHonkInsert = z.object({
  gooseId: z.number(),
  decibels: z.number(),
});

const ZHonkUpdate = z
  .object({
    decibels: z.number(),
  })
  .partial();

const honksApp = new Hono<{ Bindings: DatabaseBindings }>();

// Get all Honks (or just those from Goose specified by gooseId)
honksApp.get(
  "/",
  validator("query", (query) => {
    const gooseIdQuery = query.gooseId;

    return {
      gooseId: gooseIdQuery ? validateId(gooseIdQuery) : undefined,
    };
  }),
  async (c) => {
    const { gooseId } = c.req.valid("query");

    const db = drizzle(c.env.DB);
    let honks: schema.Honk[];

    if (gooseId) {
      honks = await db
        .select()
        .from(schema.honks)
        .where(eq(schema.honks.gooseId, gooseId));
    } else {
      honks = await db.select().from(schema.honks);
    }

    return c.json(honks);
  },
);

// Create a new Honk
honksApp.post(
  "/",
  validator("json", makeBodyValidator(ZHonkInsert)),
  async (c) => {
    const honkData = c.req.valid("json");

    const newHonk: schema.Honk = {
      id: generateId(),
      ...honkData,
    };

    return c.json(newHonk, 201);
  },
);

// Get a Honk by specified id
honksApp.get("/:id", validator("param", validateIdParam), async (c) => {
  const { id } = c.req.valid("param");

  const db = drizzle(c.env.DB);
  const honkById = await getHonkById(db, id);

  if (!honkById) {
    throw ServiceError.notFound(`No Honks with ID ${id}`);
  }

  return c.json(honkById);
});

// Modify Honk with specified id
honksApp.patch(
  "/:id",
  validator("param", validateIdParam),
  validator("json", makeBodyValidator(ZHonkUpdate)),
  async (c) => {
    const { id } = c.req.valid("param");
    const { decibels } = c.req.valid("json");

    const db = drizzle(c.env.DB);
    const honkById = await getHonkById(db, id);

    if (!honkById) {
      throw ServiceError.notFound(`No Honks with ID ${id}`);
    }

    // todo: how does patch work? relations?
    const updatedHonk: schema.Honk = {
      ...honkById,
      ...(decibels && { decibels }),
    };

    return c.json(updatedHonk);
  },
);

// Update the Honk with the specified id
honksApp.put(
  "/:id",
  validator("param", validateIdParam),
  validator("json", makeBodyValidator(ZHonkInsert)),
  async (c) => {
    const { id } = c.req.valid("param");
    const honkData = c.req.valid("json");

    const db = drizzle(c.env.DB);
    const honkById = await getHonkById(db, id);

    if (!honkById) {
      throw ServiceError.notFound(`No Honks with ID ${id}`);
    }

    const updatedHonk: schema.Honk = {
      ...honkById,
      ...honkData,
    };

    return c.json(updatedHonk);
  },
);

// Delete the Honk with the specified id
honksApp.delete("/:id", validator("param", validateIdParam), async (c) => {
  const { id } = c.req.valid("param");

  const db = drizzle(c.env.DB);
  const honkById = await getHonkById(db, id);

  if (!honkById) {
    throw ServiceError.notFound(`No Honks with ID ${id}`);
  }

  return c.body(null, 204);
});

export default honksApp;

async function getHonkById(db: DrizzleClient, id: number) {
  const honksById = await db
    .select()
    .from(schema.honks)
    .where(eq(schema.honks.id, id));

  if (honksById.length > 1) {
    throw ServiceError.corruptedData("Unique Constraint Conflict");
  }

  return honksById.at(0);
}
