import { type Context, Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { z } from "zod";

import * as schema from "../db/schema";
import { KnownError, NotFoundError } from "../lib/errors";
import { Bindings } from "../types";
import { generateId, parseBody, parseId } from "../utils";

const honksApp = new Hono<{ Bindings: Bindings }>();

// Get all Honks (or just those from Goose specified by gooseId)
honksApp.get("/", async (c) => {
  const gooseIdValue = c.req.query("gooseId");

  const gooseId = gooseIdValue
    ?  parseId(gooseIdValue)
    : undefined;

  const db = drizzle(c.env.DB);
  let honks: schema.Honk[];
  // todo: if query but no value
  if (gooseId) {
    honks = await db
      .select()
      .from(schema.honks)
      .where(eq(schema.honks.gooseId, gooseId));
  } else {
    honks = await db
      .select()
      .from(schema.honks);
  }

  return c.json(honks);
});

// Create a new Honk
honksApp.post("/", async (c) => {
  const honkData = await parseBody(c.req, ZHonkData);

  const newHonk: schema.Honk = {
    id: generateId(),
    gooseId: generateId(),
    ...honkData,
  };

  return c.json(newHonk);
});

// Get a Honk by specified id
honksApp.get("/:id", async (c) => {
  const id = parseId(c.req.param("id"));

  const honkById = await getHonkById(c, id);

  if (!honkById) {
    throw new NotFoundError();
  }
    
  return c.json(honkById);
});

// Modify Honk with specified id
honksApp.patch("/:id", async (c) => {
  const id = parseId(c.req.param("id"));
  
  const {
    decibels
  } = await parseBody(c.req, ZHonkData.partial());

  const honkById = await getHonkById(c, id);

  if (!honkById) {
    throw new NotFoundError();
  }

  const updatedHonk: schema.Honk = {
    ...honkById,
    ...(decibels && { decibels }),
  };

  return c.json(updatedHonk);
});

const ZHonkData = z.object({
  decibels: z.number()
})

// Update the Honk with the specified id
honksApp.put("/:id", async (c) => {
  const id = parseId(c.req.param("id"));

  const {
    decibels,
  } = await parseBody(c.req, ZHonkData)

  const honkById = await getHonkById(c, id);

  if (!honkById) {
    throw new NotFoundError();
  }

  const updatedHonk: schema.Honk = {
    ...honkById,
    decibels,
  };

  return c.json(updatedHonk);
})

// Delete the Honk with the specified id
honksApp.delete("/:id", async (c) => {
  const id = parseId(c.req.param("id"));
  
  const honkById = await getHonkById(c, id);

  if (!honkById) {
    throw new NotFoundError();
  }

  return c.body(null, 204);
});

export default honksApp;

async function getHonkById(c: Context, id: number) {
    const db = drizzle(c.env.DB);
    const honksById = await db
      .select()
      .from(schema.honks)
      .where(eq(schema.honks.id, id));
  
    if (honksById.length > 1) {
      throw new KnownError("Unique Constraint Conflict");
    };
  
    return honksById.at(0);
  }