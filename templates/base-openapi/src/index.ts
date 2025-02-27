import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import * as schema from "./db/schema";
import { createFiberplane } from "@fiberplane/hono";

// Types for environment variables and context
type Bindings = {
  DATABASE_URL: string;
};

type Variables = {
  db: NeonHttpDatabase;
};

// Create the app with type-safe bindings and variables
// For more information on OpenAPIHono, see: https://hono.dev/examples/zod-openapi
const app = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>();

// Middleware: Set up database connection for all routes
app.use(async (c, next) => {
  const sql = neon(c.env.DATABASE_URL);
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
    example: "Nikita",
  }),
  email: z.string().email().openapi({
    example: "nikita@neon.tech",
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

const NewUserSchema = z.object({
  name: z.string().openapi({
    example: "Nikita",
  }),
  email: z.string().email().openapi({
    example: "nikita@neon.tech",
  }),
}).openapi("NewUser");

const getUser = createRoute({
  method: "get",
  path: "/api/users/{id}",
  request: {
    // Validate and parse URL parameters
    params: z.object({
      id: z.string().uuid().openapi({
        example: "123e4567-e89b-12d3-a456-426614174000",
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

const createUser = createRoute({
  method: "post",
  path: "/api/users",
  request: {
    // Validate request body using Zod schemas
    body: {
      required: true, // NOTE: this is important to set to true, otherwise the route will accept empty body
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
app.openapi(root, async (c) => {
  return c.text("Honc! 🪿");
})
  .openapi(getUsers, async (c) => {
    const db = c.get("db");
    const users = await db.select().from(schema.users);
    return c.json(users, 200);
  })
  .openapi(getUser, async (c) => {
    const db = c.get("db");
    const { id } = c.req.valid("param");
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return c.json(user, 200);
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
  // Generate OpenAPI documentation at /openapi.json
  .doc("/openapi.json", {
    openapi: "3.0.0",
    info: {
      title: "Honc! 🪿",
      version: "1.0.0",
      description: "Honc! 🪿",
    },
  })
  .use("/fp/*", createFiberplane({
    app,
    openapi: { url: "/openapi.json" },
  }));

export default app;
