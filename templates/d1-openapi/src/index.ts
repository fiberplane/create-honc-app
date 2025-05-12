import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { createFiberplane } from "@fiberplane/hono";
import { describeRoute, openAPISpecs } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import z from "zod";
import { Hono } from "hono";
import "zod-openapi/extend";
import * as schema from "./db/schema";

// Types for environment variables and context
type Bindings = {
	DB: D1Database; // Cloudflare D1 database binding
};

type Variables = {
	db: DrizzleD1Database;
};

// Create the app with type-safe bindings and variables
// For more information on OpenAPIHono, see: https://hono.dev/examples/zod-openapi
const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Middleware: Set up D1 database connection for all routes
app.use(async (c, next) => {
	const db = drizzle(c.env.DB);
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
			example: "Matthew",
		}),
		email: z.string().email().openapi({
			example: "matthew@cloudflare.com",
		}),
	})
	.openapi({ ref: "User" });

const NewUserSchema = z
	.object({
		name: z.string().openapi({
			example: "Matthew",
		}),
		email: z.string().email().openapi({
			example: "matthew@cloudflare.com",
		}),
	})
	.openapi({ ref: "NewUser" });

const apiRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>()
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
			return c.json(users);
		},
	)
	.post(
		"/",
		describeRoute({
			responses: {
				201: {
					content: {
						"application/json": {
							schema: resolver(UserSchema),
						},
					},
					description: "User created successfully",
				},
			},
		}),
		zValidator("json", NewUserSchema),
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
				id: z.coerce.number().openapi({
					example: 1,
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
			return c.json(user);
		},
	);

// Route Implementations
// Connect the route definitions to their handlers using .openapi()
app
	.get(
		"/",
		describeRoute({
			responses: {
				200: {
					content: { "text/plain": { schema: z.string() } },
					description: "Root fetched successfully",
				},
			},
		}),
		(c) => {
			return c.text("Honc from above! ☁️🪿");
		},
	)
	.route("/api/users", apiRouter);

// Generate OpenAPI spec at /openapi.json
app
	.get(
		"/openapi.json",
		openAPISpecs(app, {
			documentation: {
				info: {
					title: "D1 Honc! 🪿☁️",
					version: "1.0.0",
					description: "D1 Honc! 🪿☁️",
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
