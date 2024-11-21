import { instrument } from "@fiberplane/hono-otel";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { Hono } from "hono";
import { geese } from "./db/schema";

type Bindings = {
  DATABASE_URL: string;
  R2_BUCKET: R2Bucket;
  AI: Ai;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Honc! 🪿");
});

app.post("/api/geese/:name", async (c) => {
  const { name } = c.req.param();

  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  const maybeGoose = await db.select().from(geese).where(eq(geese.name, name));

  if (maybeGoose.length !== 0) {
    return c.json(
      {
        error: "already_exists",
      },
      400,
    );
  }

  const model =
    "@cf/black-forest-labs/flux-1-schnell" as BaseAiTextToImageModels;
  const prompt = `Please generate a image of a goose. Its name is ${name}. Make it in the style of comic or anime please`;

  const response = await c.env.AI.run(model, {
    prompt,
  });

  // NOTE - The cloudflare types are wrong here. This code works.
  const base64image = response.image;
  const buffer = Buffer.from(base64image, "base64");

  await c.env.R2_BUCKET.put(`${name}.png`, buffer);

  const [goose] = await db
    .insert(geese)
    .values({
      name,
    })
    .returning();

  return c.json({
    status: "OK",
    id: goose.id,
  });
});

app.get("/api/geese", async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  return c.json({
    geese: await db.select().from(geese),
  });
});

app.get("/api/geese/:name", async (c) => {
  const { name } = c.req.param();

  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  const goose = await db.select().from(geese).where(eq(geese.name, name));

  if (goose.length === 0) {
    return c.json(
      {
        error: "doesnt_exist",
      },
      404,
    );
  }

  const image = await c.env.R2_BUCKET.get(`${name}.png`);

  if (!image) {
    return c.json(
      {
        error: "image_not_found",
      },
      404,
    );
  }

  c.header("Content-Type", "image/png");
  return c.body(image.body);
});

export default instrument(app);
