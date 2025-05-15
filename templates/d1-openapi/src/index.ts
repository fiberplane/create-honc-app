import { createFiberplane } from "@fiberplane/hono";
import { eq } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { describeRoute, openAPISpecs } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import * as schema from "./db/schema";
import { ZUserByIDParams, ZUserInsert, ZUserSelect } from "./dtos";
import { zodValidator } from "./middleware/validator";

const initDb = createMiddleware<{
  Bindings: {
    DB: D1Database;
  };
  Variables: {
    db: DrizzleD1Database;
  };
}>(async (c, next) => {
  const db = drizzle(c.env.DB, {
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
            }
          },
        }
      }
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
            }
          },
        }
      }
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
    }
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
            }
          },
        }
      }
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
    }
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
 * Serve a simplified api specification for your API
 * As of writing, this is just the list of routes and their methods.
 */
app.get(
  "/openapi.json", 
  openAPISpecs(app, {
    documentation: {
      info: {
        title: "HONC D1 App",
        version: "1.0.0",
      },
    }
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

// Export the instrumented app if you've wired up a Fiberplane-Hono-OpenTelemetry trace collector
//
// export default instrument(app);
