import { createFiberplane, createOpenAPISpec } from "@fiberplane/hono";
import { instrument } from "@fiberplane/hono-otel";
import { eq } from "drizzle-orm";
import { type PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import postgres from "postgres";
import * as schema from "./db/schema";

const initDb = createMiddleware<{
  Bindings: {
    DATABASE_URL: string;
  };
  Variables: {
    db: PostgresJsDatabase;
  };
}>(async (c, next) => {
  const client = postgres(c.env.DATABASE_URL);
  const db = drizzle(client, {
    casing: "snake_case",
  });

  c.set("db", db);
  await next();
});

const api = new Hono()
  .use("*", initDb)
  .get("/users", async (c) => {
    const db = c.var.db;
    const users = await db.select().from(schema.users);

    return c.json(users);
  })
  .get("/users/:id", async (c) => {
    const db = c.var.db;
    const id = c.req.param("id");

    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id));

    return c.json(user);
  })
  .post("/users", async (c) => {
    const db = c.var.db;
    const { name, email } = await c.req.json();

    const [newUser] = await db
      .insert(schema.users)
      .values({
        name: name,
        email: email,
      })
      .returning();

    return c.json(newUser, 201);
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
        title: "HONC Supabase App",
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

// Export the instrumented app if you've wired up a Fiberplane-Hono-OpenTelemetry trace collector
//
// export default instrument(app);
