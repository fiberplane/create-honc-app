import { Hono } from "hono";
import { cors } from "hono/cors";
import { agentsMiddleware } from "hono-agents";
import { drizzle } from "drizzle-orm/d1";
import specificationsRouter from "./routes/specifications";
import { DialogueAgent } from "./agents/dialogue-agent";
import type { AppType } from "./types";

const app = new Hono<AppType>();

// Enable CORS
app.use("*", cors());

// Mount the Clouflare agents middleware
app.use("*", agentsMiddleware());

// NOTE: You can use custom routing if you want to:
//
// app.use(
//   "*",
//   agentsMiddleware({
//     options: {
//       prefix: "agents", // Handles /agents/* routes only
//     },
//   })
// );

// Middleware to inject the database into the context
app.use("*", async (c, next) => {
  const db = drizzle(c.env.DB);
  c.set("db", db);
  await next();
});

// Mount the routers that handles the specification resource
app.route("/api/specifications", specificationsRouter);

// Need to export the agent so Cloudflare can run it
export { DialogueAgent };

export default app;
