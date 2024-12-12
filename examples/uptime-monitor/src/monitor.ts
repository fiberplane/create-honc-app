import { eq } from "drizzle-orm";
// src/monitor.ts
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema";
import type { Website } from "./db/schema";

interface Env {
  DB: D1Database;
}

/**
 * The Monitor class is a Durable Object that is used to monitor the uptime of a website.
 * It is used to schedule periodic checks of the website's uptime and store the results in the database.
 * 
 * It's configured in the `wrangler.toml` file like so:
  ```toml
    [durable_objects]
    bindings = [
      { name = "SCHEDULED_MONITOR", class_name = "Monitor" }
    ]
  ```
 *
 * An alternative approach here would be to use Cloudflare Workers Cron Triggers
 * https://developers.cloudflare.com/workers/configuration/cron-triggers/
 */
export class Monitor {
  private state: DurableObjectState;
  private env: Env;
  private checkTimer: ReturnType<typeof setInterval> | null = null;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request) {
    const url = new URL(request.url);

    switch (url.pathname) {
      case "/schedule": {
        const websiteId = url.searchParams.get("websiteId");
        if (!websiteId) {
          return new Response("Website ID is required", { status: 400 });
        }
        await this.scheduleChecks(Number.parseInt(websiteId));
        return new Response("Monitoring scheduled");
      }
      default:
        return new Response("Not found", { status: 404 });
    }
  }

  async scheduleChecks(websiteId: number) {
    // Clear existing timer if any
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
    }

    const db = drizzle(this.env.DB);

    // Get website details
    const website = await db
      .select()
      .from(schema.websites)
      .where(eq(schema.websites.id, websiteId))
      .get();

    if (!website) {
      console.error(`Website ${websiteId} not found`);
      return;
    }

    console.log(
      `Found website: ${website.name}, interval: ${website.checkInterval}s`,
    );

    // Schedule periodic checks
    this.checkTimer = setInterval(async () => {
      await this.performCheck(website).catch((error) => {
        console.error("Error performing check:", error);
      });
    }, website.checkInterval * 1000);

    // Perform initial check
    await this.performCheck(website).catch((error) => {
      console.error("Error performing initial check:", error);
    });
  }

  async performCheck(website: Website) {
    console.log(`Performing check for ${website.name} (${website.url})`);
    let isUp = false;
    let responseTime = 0;
    let status = 0;
    const db = drizzle(this.env.DB);

    const startTime = Date.now();

    try {
      const response = await fetch(website.url, {
        method: "GET",
        redirect: "follow",
        cf: {
          cacheTTL: 0,
          cacheEverything: false,
        },
      });

      responseTime = Date.now() - startTime;
      status = response.status;
      isUp = response.status >= 200 && response.status < 400;
      console.log(
        `Check complete - Status: ${status}, Response Time: ${responseTime}ms, Up: ${isUp}`,
      );
    } catch (error) {
      responseTime = Date.now() - startTime;
      isUp = false;
      console.error("Error performing check:", error);
    }

    // Store check result
    try {
      await db.insert(schema.uptimeChecks).values({
        websiteId: website.id,
        timestamp: new Date().toISOString(),
        status,
        responseTime,
        isUp,
      });
    } catch (error) {
      console.error("Error storing check result:", error);
    }
  }
}
