import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { describeRoute, openAPISpecs } from "hono-openapi";
import { Hono } from "hono";
import * as schema from "./db/schema";
import { createFiberplane } from "@fiberplane/hono";
import z from "zod";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import "zod-openapi/extend";

// Types for environment variables and context
type Bindings = {
  DATABASE_URL: string;
};

type Variables = {
  db: NeonHttpDatabase;
};

// Create the app with type-safe bindings and variables
// For more information on OpenAPIHono, see: https://hono.dev/examples/zod-openapi
const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Middleware: Set up database connection for all routes
app.use(async (c, next) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);
  c.set("db", db);
  await next();
});

// Define the expected response shape using Zod
//
// We can add openapi documentation, as well as name the Schema in the OpenAPI document,
// by chaining `openapi` on the zod schema definitions
const UserSchema = z
  .object({
    id: z.number().openapi({
      example: 1,
    }),
    name: z.string().openapi({
      example: "Nikita",
    }),
    email: z.string().email().openapi({
      example: "nikita@neon.tech",
    }),
  })
  .openapi({ ref: "User" });

const apiRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

apiRouter
  .get(
    "/",
    describeRoute({
      responses: {
        200: {
          content: {
            "application/json": { schema: resolver(z.array(UserSchema)) },
          },
          description: "Users fetched successfully",
        },
      },
    }),
    async (c) => {
      const db = c.get("db");
      const users = await db.select().from(schema.users);
      return c.json(users, 200);
    },
  )
  .post(
    "/",
    describeRoute({
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
    }),
    zValidator(
      "json",
      z
        .object({
          name: z.string().openapi({
            example: "Nikita",
          }),
          email: z.string().email().openapi({
            example: "nikita@neon.tech",
          }),
        })
        .openapi({ ref: "NewUser" }),
    ),
    async (c) => {
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
    },
  )
  .get(
    "/:id",
    describeRoute({
      responses: {
        200: {
          content: { "application/json": { schema: resolver(UserSchema) } },
          description: "User fetched successfully",
        },
      },
    }),
    zValidator(
      "param",
      z.object({
        id: z.string().uuid().openapi({
          example: "123e4567-e89b-12d3-a456-426614174000",
        }),
      }),
    ),
    async (c) => {
      const db = c.get("db");
      const { id } = c.req.valid("param");
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, id));
      return c.json(user, 200);
    },
  );

// Route Implementations
app
  .get(
    "/",
    describeRoute({
      responses: {
        200: {
          content: { "text/plain": { schema: resolver(z.string()) } },
          description: "Root fetched successfully",
        },
      },
    }),
    async (c) => {
      return c.text("Honc! 🪿");
    },
  )
  .route("/api/users", apiRouter);

// Generate OpenAPI documentation at /openapi.json
app
  .get(
    "/openapi.json",
    openAPISpecs(app, {
      documentation: {
        info: {
          title: "Honc! 🪿",
          version: "1.0.0",
          description: "Honc! 🪿",
        },
      },
    }),
  )
  .use(
    "/fp/*",
    createFiberplane({
      app,
      openapi: { url: "/openapi.json" },
    }),
  );

export default app;
