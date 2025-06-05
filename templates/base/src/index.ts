import { createFiberplane, createOpenAPISpec } from "@fiberplane/hono";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import * as schema from "./db/schema";
import { ZUserByIDParams, ZUserInsert } from "./dtos";
import { dbProvider } from "./middleware/dbProvider";
import { zodValidator } from "./middleware/validator";

const api = new Hono()
  .use("*", dbProvider)
  .get("/users", async (c) => {
    const db = c.var.db;
    const users = await db.select().from(schema.users);

    return c.json(users);
  })
  .post("/users", zodValidator("json", ZUserInsert), async (c) => {
    const db = c.var.db;
    const { name, email } = c.req.valid("json");

    const [newUser] = await db
      .insert(schema.users)
      .values({
        name: name,
        email: email,
      })
      .returning();

    return c.json(newUser, 201);
  })
  .get("/users/:id", zodValidator("param", ZUserByIDParams), async (c) => {
    const db = c.var.db;
    const { id } = c.req.valid("param");

    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id));

    if (!user) {
      return c.notFound();
    }

    return c.json(user);
  })
  .delete("/users/:id", zodValidator("param", ZUserByIDParams), async (c) => {
    const db = c.var.db;
    const { id } = c.req.valid("param");

    await db.delete(schema.users).where(eq(schema.users.id, id));

    return c.body(null, 204);
  });

const app = new Hono()
  .get("/", (c) => {
    return c.text("Honc from above! ☁️🪿");
  })
  .route("/api", api);

app.onError((error, c) => {
  console.error(error);
  if (error instanceof HTTPException) {
    return c.json(
      {
        message: error.message,
      },
      error.status,
    );
  }

  return c.json(
    {
      message: "Something went wrong",
    },
    500,
  );
});

/**
 * Serve a simplified api specification for your API
 * As of writing, this is just the list of routes and their methods.
 */
app.get("/openapi.json", (c) => {
  return c.json(
    createOpenAPISpec(app, {
      info: {
        title: "HONC Neon App",
        version: "1.0.0",
      },
    }),
  );
});

/**
 * Mount the Fiberplane api explorer to be able to make requests against your API.
 *
 * Visit the explorer at `/fp`
 */
app.use(
  "/fp/*",
  createFiberplane({
    app,
    openapi: { url: "/openapi.json" },
  }),
);

export default app;
