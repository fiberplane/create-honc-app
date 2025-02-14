import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import postgres from "postgres";
import * as schema from "./db/schema";
import { createFiberplane } from "@fiberplane/hono";

// Types for environment variables and context
type Bindings = {
  DATABASE_URL: string; // Supabase PostgreSQL connection string
};

type Variables = {
  db: PostgresJsDatabase;
};

// Create the app with type-safe bindings and variables
// For more information on OpenAPIHono, see: https://hono.dev/examples/zod-openapi
const app = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>();

// Middleware: Set up Postgres connection for all routes
app.use(async (c, next) => {
  const sql = postgres(c.env.DATABASE_URL);
  const db = drizzle(sql);
  c.set("db", db);
  await next();
});

// Route Definitions
// Each route is defined separately with its request/response schema
// This enables automatic OpenAPI documentation and type safety

const root = createRoute({
  method: "get",
  path: "/",
  responses: {
    200: {
      content: { "text/plain": { schema: z.string() } },
      description: "Root fetched successfully",
    },
  },
});

// Define the expected response shape using Zod
//
// We can add openapi documentation, as well as name the Schema in the OpenAPI document,
// by chaining `openapi` on the zod schema definitions
const UserSchema = z.object({
  id: z.number().openapi({
    example: 1,
  }),
  name: z.string().openapi({
    example: "Paul",
  }),
  email: z.string().email().openapi({
    example: "paul@supabase.com",
  }),
}).openapi("User");

const getUsers = createRoute({
  method: "get",
  path: "/api/users",
  responses: {
    200: {
      content: { "application/json": { schema: z.array(UserSchema) } },
      description: "Users fetched successfully",
    },
  },
});

const getUser = createRoute({
  method: "get",
  path: "/api/users/{id}",
  request: {
    // Validate and parse URL parameters
    params: z.object({
      id: z.coerce.number().openapi({
        example: 1,
      }),
    }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: UserSchema } },
      description: "User fetched successfully",
    },
  },
});

const NewUserSchema = z.object({
  name: z.string().openapi({
    example: "Paul",
  }),
  email: z.string().email().openapi({
    example: "paul@supabase.com",
  }),
}).openapi("NewUser");

const createUser = createRoute({
  method: "post",
  path: "/users",
  request: {
    // Validate request body using Zod schemas
    body: {
      required: true,
      content: {
        "application/json": {
          schema: NewUserSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
      description: "User created successfully",
    },
  },
});

// Route Implementations
// Connect the route definitions to their handlers using .openapi()
app.openapi(root, (c) => {
  return c.text("Supa Honc! 📯🪿📯🪿📯🪿📯");
})
  .openapi(getUsers, async (c) => {
    const db = c.get("db");
    const users = await db.select().from(schema.users);
    return c.json(users);
  })
  .openapi(getUser, async (c) => {
    const db = c.get("db");
    const { id } = c.req.valid("param");
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return c.json(user);
  })
  .openapi(createUser, async (c) => {
    const db = c.get("db");
    const { name, email } = c.req.valid("json");

    const [newUser] = await db
      .insert(schema.users)
      .values({
        name,
        email,
      })
      .returning();

    return c.json(newUser, 201);
  })
  // Generate OpenAPI spec at /openapi.json
  .doc("/openapi.json", {
    openapi: "3.0.0",
    info: {
      title: "Supa Honc! 📯🪿📯🪿📯🪿📯",
      version: "1.0.0",
      description: "Supa Honc! 📯🪿📯🪿📯🪿📯",
    },
  })
  .use("/fp/*", createFiberplane({
    openapi: { url: "/openapi.json" },
  }));

export default app;
