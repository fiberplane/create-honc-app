import { instrument } from "@fiberplane/hono-otel";
import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { Style } from "hono/css";
import { jsxRenderer } from "hono/jsx-renderer";

import { WebsiteList } from "./components/WebsiteList";
import * as schema from "./db/schema";
import { Monitor } from "./monitor";

type Bindings = {
  DB: D1Database;
  SCHEDULED_MONITOR: DurableObjectNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS
app.use('/*', cors())

app.get(
  "/",
  jsxRenderer(
    ({ children }) => {
      return (
        <html lang="en">
          <head>
            <title>Website Monitor</title>
            <meta charset="utf-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            <Style />
          </head>
          <body>
            <main>{children}</main>
          </body>
        </html>
      );
    },
    { docType: true }
  ),
  async (c) => {
    const db = drizzle(c.env.DB);
    const websites = await db.select().from(schema.websites);
    return c.render(<WebsiteList websites={websites} />);
  }
);

// CRUD for Websites
app.get("/api/websites", async (c) => {
  const db = drizzle(c.env.DB);
  //TODO Wrap in try catch
  const websites = await db.select().from(schema.websites);
  return c.json({ websites });
});

app.post("/api/website", async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    const data = await c.req.json();
    
    // Validate required fields
    if (!data.url || !data.name || !data.checkInterval) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const [newWebsite] = await db.insert(schema.websites)
      .values({
        url: data.url,
        name: data.name,
        checkInterval: data.checkInterval,
        createdAt: new Date().toISOString(),
      })
      .returning();

    // Create monitor with the new website's ID
    const monitor = c.env.SCHEDULED_MONITOR.get(
      c.env.SCHEDULED_MONITOR.idFromName(newWebsite.id.toString())
    );
    await monitor.fetch(new Request('https://monitor/schedule?websiteId=' + newWebsite.id));

    return c.json(newWebsite);
  } catch (error) {
    console.error("Error creating website:", error);
    return c.json({ error: "Failed to create website" }, 500);
  }
});

app.get("/api/website/:id", async (c) => {
  const db = drizzle(c.env.DB);
  const websiteId = c.req.param("id");

  //TODO: wrap in try catch
  const website = await db
    .select()
    .from(schema.websites)
    .where(eq(schema.websites.id, parseInt(websiteId)))
    .limit(1);

  if (!website.length) {
    return c.json({ error: "Website not found" }, 404);
  }

  return c.json(website[0]);
});

app.delete("/api/website/:id", async (c) => {
  const db = drizzle(c.env.DB);
  const websiteId = c.req.param("id");

  //TODO: wrap in try catch
  const [deletedWebsite] = await db
    .delete(schema.websites)
    .where(eq(schema.websites.id, parseInt(websiteId)))
    .returning();

  if (!deletedWebsite) {
    return c.json({ error: "Website not found" }, 404);
  }

  return c.json(deletedWebsite);
});

app.get("/api/website/:id/checks", async (c) => {
  const db = drizzle(c.env.DB);
  const websiteId = c.req.param("id");

  try {
    const uptimeChecks = await db
      .select()
      .from(schema.uptimeChecks)
      .where(eq(schema.uptimeChecks.websiteId, websiteId))
      .orderBy(desc(schema.uptimeChecks.timestamp))
      .limit(100); // Limiting to last 100 checks, adjust as needed

    return c.json(uptimeChecks);
  } catch (error) {
    console.error("Error fetching uptime checks:", error);
    return c.json({ error: "Failed to fetch uptime checks" }, 500);
  }
});

// Get uptime percentage for a website
app.get('/websites/:id/uptime', async (c) => {
  const { id } = c.req.param()
  const days = c.req.query('days') != null ? parseInt(c.req.query('days')!) : 7
  const db = drizzle(c.env.DB)

  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const checks = await db.select()
      .from(schema.uptimeChecks)
      .where(
        and(
          eq(schema.uptimeChecks.websiteId, id),
          sql`${schema.uptimeChecks.timestamp} >= ${startDate.toISOString()}`
        )
      )
    
    if (!checks.length) {
      return c.json({ error: 'No data found' }, 404)
    }

    const upCount = checks.filter(check => check.isUp).length
    const uptimePercentage = (upCount / checks.length) * 100

    return c.json({ 
      uptimePercentage: Math.round(uptimePercentage * 100) / 100,
      period: `${days} days`
    })
  } catch (error) {
    return c.json({ error: 'Failed to calculate uptime' }, 500)
  }
})




// TODO: Implement streaming or realtime updates for website status
// See: https://hono.dev/docs/helpers/streaming#streaming-helper
// See: https://developers.cloudflare.com/durable-objects/
// See: https://fiberplane.com/blog/creating-websocket-server-hono-durable-objects/

export default instrument(app);
export { Monitor };
