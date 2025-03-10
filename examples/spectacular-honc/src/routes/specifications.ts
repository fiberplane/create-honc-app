import { Hono } from "hono";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { specifications } from "../db/schema";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

// Create a typed Hono app
type Variables = {
  db: DrizzleD1Database;
};

const specificationsRouter = new Hono<{ Variables: Variables }>();

// Schema for specification creation/update
const specificationSchema = z.object({
  content: z.string().min(1),
  version: z.number().int().positive().optional(),
});

// Create a new specification
specificationsRouter.post(
  "/",
  zValidator("json", specificationSchema),
  async (c) => {
    const db = c.get("db");
    const data = c.req.valid("json");

    const [specification] = await db
      .insert(specifications)
      .values({
        ...data,
        version: 1,
      })
      .returning();

    return c.json(specification, 201);
  }
);

// Get a specific specification
specificationsRouter.get("/:id", async (c) => {
  const db = c.get("db");
  const id = Number.parseInt(c.req.param("id"), 10);

  const specification = await db
    .select()
    .from(specifications)
    .where(eq(specifications.id, id))
    .get();

  if (!specification) {
    return c.json({ error: "Specification not found" }, 404);
  }

  return c.json(specification);
});

// Update a specification
specificationsRouter.put(
  "/:id",
  zValidator("json", specificationSchema),
  async (c) => {
    const db = c.get("db");
    const id = Number.parseInt(c.req.param("id"), 10);
    const data = c.req.valid("json");

    const [updated] = await db
      .update(specifications)
      .set({
        ...data,
        // TODO - update version?
        updatedAt: new Date(),
      })
      .where(eq(specifications.id, id))
      .returning();

    if (!updated) {
      return c.json({ error: "Specification not found" }, 404);
    }

    return c.json(updated);
  }
);

// Delete a specification
specificationsRouter.delete("/:id", async (c) => {
  const db = c.get("db");
  const id = Number.parseInt(c.req.param("id"), 10);

  const [deleted] = await db
    .delete(specifications)
    .where(eq(specifications.id, id))
    .returning();

  if (!deleted) {
    return c.json({ error: "Specification not found" }, 404);
  }

  return c.json({ message: "Specification deleted successfully" });
});

export default specificationsRouter; 