import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { users } from "./db/schema";

// Types for environment variables and context
type Bindings = {
	DATABASE_URL: string;
};

type Variables = {
	db: NeonHttpDatabase;
};

// Create the app with type-safe bindings and variables
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

const getUsers = createRoute({
	method: "get",
	path: "/users",
	responses: {
		200: {
			// Define the expected response shape using Zod
			content: { "application/json": { schema: z.object({}) } },
			description: "Users fetched successfully",
		},
	},
});

const getUser = createRoute({
	method: "get",
	path: "/users/{id}",
	request: {
		// Validate and parse URL parameters
		params: z.object({
			id: z.coerce.number(),
		}),
	},
	responses: {
		200: {
			content: { "application/json": { schema: z.object({}) } },
			description: "User fetched successfully",
		},
	},
});

const createUser = createRoute({
	method: "post",
	path: "/users",
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
app.openapi(root, async (c) => {
	return c.text("Honc! 🪿");
})
	.openapi(getUsers, async (c) => {
		const db = c.get("db");
		return c.json({
			users: await db.select().from(users),
		});
	})
	.openapi(getUser, async (c) => {
		const db = c.get("db");
		const { id } = c.req.valid("param");
		return c.json({
			user: await db.select().from(users).where(eq(users.id, id)),
		});
	})
	.openapi(createUser, async (c) => {
		const db = c.get("db");
		const { name, email } = c.req.valid("json");
		const user = await db.insert(users).values({ name, email }).returning();
		return c.json(
			{
				name: user[0].name!,
				id: user[0].id,
				email: user[0].email!,
			},
			201
		);
	})
	// Generate OpenAPI documentation at /openapi.json
	.doc("/openapi.json", {
		openapi: "3.0.0",
		info: {
			title: "Honc! 🪿",
			version: "1.0.0",
			description: "Honc! 🪿",
		},
	});

export default app;
