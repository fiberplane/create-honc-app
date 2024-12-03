import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { validator } from "hono/validator";

import { getGaggleById, getGaggleByIdExists } from "../controllers";
import { getDb } from "../db";
import * as schema from "../db/schema";
import { ZGaggleInsertPayload } from "../dtos";
import { generateId } from "../lib/utils";
import { makeBodyValidator, validateIdParam } from "../lib/validation";
import type { AppType } from "../types";

const gagglesApp = new Hono<AppType>();

// Get all Gaggles
gagglesApp.get("/", async (c) => {
  const db = getDb(c.env.DB);
  const gaggles = await db.select().from(schema.gaggles);

  return c.json(gaggles);
});

// Create a new Gaggle
gagglesApp.post(
  "/",
  validator("json", makeBodyValidator(ZGaggleInsertPayload.parse)),
  async (c) => {
    const gaggleData = c.req.valid("json");

    const newGaggle: schema.Gaggle = {
      id: generateId(),
      // Default for optional property
      territory: null,
      ...gaggleData,
    };

    return c.json(newGaggle, 201);
  },
);

// Get a specific Gaggle by id
gagglesApp.get("/:id", validator("param", validateIdParam), async (c) => {
  const { id } = c.req.valid("param");

  const db = getDb(c.env.DB);
  const gaggleById = await getGaggleById(db, id);

  if (!gaggleById) {
    throw new HTTPException(404, {
      message: `No Gaggle with ID ${id}`,
    });
  }

  return c.json(gaggleById);
});

// Get Geese in the Gaggle specified by id
gagglesApp.get("/:id/geese", validator("param", validateIdParam), async (c) => {
  const { id } = c.req.valid("param");

  const db = getDb(c.env.DB);
  const gaggleExists = await getGaggleByIdExists(db, id);

  if (!gaggleExists) {
    throw new HTTPException(404, {
      message: `No Gaggle with ID ${id}`,
    });
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
  validator("json", makeBodyValidator(ZGaggleInsertPayload.parse)),
  async (c) => {
    const { id } = c.req.valid("param");
    const gaggleData = c.req.valid("json");

    const db = getDb(c.env.DB);
    const gaggleById = await getGaggleById(db, id);

    if (!gaggleById) {
      throw new HTTPException(404, {
        message: `No Gaggle with ID ${id}`,
      });
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

  const db = getDb(c.env.DB);
  const gaggleExists = await getGaggleByIdExists(db, id);

  if (!gaggleExists) {
    throw new HTTPException(404, {
      message: `No Gaggle with ID ${id}`,
    });
  }

  return c.body(null, 204);
});

export default gagglesApp;
