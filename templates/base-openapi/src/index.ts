import { createFiberplane } from "@fiberplane/hono";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { type NeonHttpDatabase, drizzle } from "drizzle-orm/neon-http";
import { Hono } from "hono";
import { describeRoute, openAPISpecs } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import * as schema from "./db/schema";
import { ZUserByIDParams, ZUserInsert, ZUserSelect } from "./dtos";
import { zodValidator } from "./middleware/validator";

const initDb = createMiddleware<{
  Bindings: {
    DATABASE_URL: string;
  };
  Variables: {
    db: NeonHttpDatabase;
  };
}>(async (c, next) => {
  const client = neon(c.env.DATABASE_URL);
  const db = drizzle(client, {
    casing: "snake_case",
  });

  c.set("db", db);
  await next();
});

const api = new Hono()
  .use("*", initDb)
  .get(
    "/users",
    describeRoute({
      responses: {
        200: {
          description: "Users queried successfully",
          content: {
            "application/json": {
              schema: resolver(ZUserSelect.array()),
            },
          },
        },
      },
    }),
    async (c) => {
      const db = c.var.db;
      const users = await db.select().from(schema.users);

      return c.json(users);
    },
  )
  .post(
    "/users",
    describeRoute({
      responses: {
        201: {
          description: "User created successfully",
          content: {
            "application/json": {
              schema: resolver(ZUserSelect),
            },
          },
        },
      },
    }),
    /**
     * Add request data to the OpenAPI spec through
     * validators, not `describeRoute` options
     */
    zodValidator("json", ZUserInsert),
    async (c) => {
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
    },
  )
  .get(
    "/users/:id",
    describeRoute({
      responses: {
        200: {
          description: "User queried by ID successfully",
          content: {
            "application/json": {
              schema: resolver(ZUserSelect),
            },
          },
        },
      },
    }),
    zodValidator("param", ZUserByIDParams),
    async (c) => {
      const db = c.var.db;
      const { id } = c.req.valid("param");

      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, id));

      return c.json(user);
    },
  );

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
 * Generate OpenAPI spec at /openapi.json
 */
app.get(
  "/openapi.json",
  openAPISpecs(app, {
    documentation: {
      info: {
        title: "HONC Neon App",
        version: "1.0.0",
      },
    },
  }),
);

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
