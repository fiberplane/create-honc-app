import { type Context, Hono } from "hono";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Bindings } from "../types";
import * as schema from "../db/schema";
import { parseId } from "../utils";

const geeseApp = new Hono<{ Bindings: Bindings }>();

// Get all Geese
geeseApp.get("/", async (c) => {
  const db = drizzle(c.env.DB);
  const geese = await db
    .select()
    .from(schema.geese);

  return c.json(geese);
});

// Get Goose by specified id
geeseApp.get("/:id", async (c) => {
  const id = parseId(c.req.param("id"));

  const gooseById = await getGooseById(c, id);

  if (!gooseById) {
    // todo: 404
    throw new Error();
  }

  return c.json(gooseById);
});

geeseApp.get("/:id/honks", async (c) => {
  const id = parseId(c.req.param("id"));
  
  const gooseById = await getGooseById(c, id);

  if (!gooseById) {
    // todo: 404
    throw new Error();
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
      // todo
      throw new Error("Unique Constraint Conflict");
    };
  
    return geeseById.at(0);
  }