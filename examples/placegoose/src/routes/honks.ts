import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { validator } from "hono/validator";
import { z } from "zod";

import { getGooseById, getHonkById } from "../controllers";
import { getDb } from "../db";
import * as schema from "../db/schema";
import { generateId } from "../lib/utils";
import {
  makeBodyValidator,
  validateId,
  validateIdParam,
} from "../lib/validation";
import type { DatabaseBindings } from "../types";

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

    const db = getDb(c.env.DB);
    let honks: schema.Honk[];

    if (gooseId) {
      const gooseById = await getGooseById(db, gooseId);

      if (!gooseById) {
        throw new HTTPException(404, {
          message: `No Geese with ID ${gooseId}`,
        });
      }

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
  validator("json", makeBodyValidator(ZHonkInsert.parse)),
  async (c) => {
    const honkData = c.req.valid("json");
    const gooseId = honkData.gooseId;

    const db = getDb(c.env.DB);
    const gooseById = await getGooseById(db, gooseId);

    if (!gooseById) {
      throw new HTTPException(404, {
        message: `No Geese with ID ${gooseId}`,
      });
    }

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

  const db = getDb(c.env.DB);
  const honkById = await getHonkById(db, id);

  if (!honkById) {
    throw new HTTPException(404, {
      message: `No Honks with ID ${id}`,
    });
  }

  return c.json(honkById);
});

// Modify Honk with specified id
honksApp.patch(
  "/:id",
  validator("param", validateIdParam),
  validator("json", makeBodyValidator(ZHonkUpdate.parse)),
  async (c) => {
    const { id } = c.req.valid("param");
    // todo: should gooseId be mutable? should there be info about this?
    const { decibels } = c.req.valid("json");

    const db = getDb(c.env.DB);
    const honkById = await getHonkById(db, id);

    if (!honkById) {
      throw new HTTPException(404, {
        message: `No Honks with ID ${id}`,
      });
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
  validator("json", makeBodyValidator(ZHonkInsert.parse)),
  async (c) => {
    const { id } = c.req.valid("param");
    // todo: should gooseId be mutable?
    const { decibels } = c.req.valid("json");

    const db = getDb(c.env.DB);
    const honkById = await getHonkById(db, id);

    if (!honkById) {
      throw new HTTPException(404, {
        message: `No Honks with ID ${id}`,
      });
    }

    const updatedHonk: schema.Honk = {
      ...honkById,
      decibels,
    };

    return c.json(updatedHonk);
  },
);

// Delete the Honk with the specified id
honksApp.delete("/:id", validator("param", validateIdParam), async (c) => {
  const { id } = c.req.valid("param");

  const db = getDb(c.env.DB);
  const honkById = await getHonkById(db, id);

  if (!honkById) {
    throw new HTTPException(404, {
      message: `No Honks with ID ${id}`,
    });
  }

  return c.body(null, 204);
});

export default honksApp;
