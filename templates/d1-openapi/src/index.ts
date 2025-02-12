import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import * as schema from "./db/schema";

// Types for environment variables and context
type Bindings = {
	DB: D1Database; // Cloudflare D1 database binding
};

type Variables = {
	db: DrizzleD1Database;
};

// Create the app with type-safe bindings and variables
const app = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>();

// Middleware: Set up D1 database connection for all routes
app.use(async (c, next) => {
	const db = drizzle(c.env.DB);
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

const getUsers = createRoute({
	method: "get",
	path: "/api/users",
	responses: {
		200: {
			// Define the expected response shape using Zod
			content: { "application/json": { schema: z.object({}) } },
			description: "Users fetched successfully",
		},
	},
});

const createUser = createRoute({
	method: "post",
	path: "/api/user",
	request: {
		// Validate request body using Zod schemas
		body: {
			required: true, // NOTE: this is important to set to true, otherwise the route will accept empty body
			content: {
				"application/json": {
					schema: z.object({
						name: z.string(),
						email: z.string().email(),
					}),
				},
			},
		},
	},
	responses: {
		201: {
			content: {
				"application/json": {
					schema: z.object({
						id: z.number(),
						name: z.string(),
						email: z.string().email(),
					}),
				},
			},
			description: "User created successfully",
		},
	},
});

// Route Implementations
// Connect the route definitions to their handlers using .openapi()
app.openapi(root, (c) => {
	return c.text("Honc from above! ☁️🪿");
})
	.openapi(getUsers, async (c) => {
		const db = c.get("db");
		const users = await db.select().from(schema.users);
		return c.json({ users });
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
			title: "D1 Honc! 🪿☁️",
			version: "1.0.0",
			description: "D1 Honc! 🪿☁️",
		},
	});

export default app;
