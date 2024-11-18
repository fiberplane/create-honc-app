import { type Context, Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { z } from "zod";

import * as schema from "../db/schema";
import { KnownError, NotFoundError } from "../lib/errors";
import { Bindings } from "../types";
import { generateId, parseBody, parseId } from "../utils";

const ZGaggleData = z.object({
    name: z.string().min(1),
    territory: z.string().min(1).nullable(),
});

const gagglesApp = new Hono<{ Bindings: Bindings }>();

// Get all Gaggles
gagglesApp.get("/", async (c) => {
  const db = drizzle(c.env.DB);
  const gaggles = await db
    .select()
    .from(schema.gaggles);

  return c.json(gaggles);
});
  
// Create a new Gaggle
gagglesApp.post("/", async (c) => {
  const {
    name,
    territory,
  } = await parseBody(c.req, ZGaggleData)

  const newGaggle: schema.Gaggle = {
    id: generateId(),
    name,
    territory,
  };

  return c.json(newGaggle);
});
    
  // Get a specific Gaggle by id
  gagglesApp.get("/:id", async (c) => {
    const id = parseId(c.req.param("id"));
  
    const gaggleById = await getGaggleById(c, id);
  
    if (!gaggleById) {
      throw new NotFoundError();
    }
  
    return c.json(gaggleById);
  });
    
  // Get Geese in the Gaggle specified by id
  gagglesApp.get("/:id/geese", async (c) => {
    const id = parseId(c.req.param("id"));
  
    // todo: redundant client?
    const gaggleById = await getGaggleById(c, id);
  
    if (!gaggleById) {
      throw new NotFoundError();
    }
  
    const db = drizzle(c.env.DB);
    const geeseByGaggleId = await db
      .select()
      .from(schema.geese)
      .where(eq(schema.geese.gaggleId, id));
  
    return c.json(geeseByGaggleId);
  })
  
  // Update Gaggle specified by id
  gagglesApp.put("/:id", async (c) => {
    const id = parseId(c.req.param("id"));
    const gaggleData = await parseBody(c.req, ZGaggleData);
    
    const gaggleById = await getGaggleById(c, id);
  
    if (!gaggleById) {
      throw new NotFoundError();
    }
  
    const updatedGaggle: schema.Gaggle = {
      ...gaggleById,
      ...gaggleData,
    };
  
    return c.json(updatedGaggle);
  });
  
  // Delete Gaggle specified by id
  gagglesApp.delete("/:id", async (c) => {
    const id = parseId(c.req.param("id"));
    
    const gaggleById = await getGaggleById(c, id);

    if (!gaggleById) {
      throw new NotFoundError();
    }
  
    return c.body(null, 204);
  });

  export default gagglesApp;

  async function getGaggleById(c: Context, id: number) {
    const db = drizzle(c.env.DB);
    const gagglesById = await db
        .select()
        .from(schema.gaggles)
        .where(eq(schema.gaggles.id, id));
    
    if (gagglesById.length > 1) {
        throw new KnownError("Unique Constraint Conflict");
    };
    
    return gagglesById.at(0);
    }
