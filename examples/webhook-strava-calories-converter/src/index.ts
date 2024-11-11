import { instrument } from "@fiberplane/hono-otel";
// import { neon } from "@neondatabase/serverless";
// import { drizzle } from "drizzle-orm/neon-http";
import { Hono } from "hono";
// import { users } from "./db/schema";

type Bindings = {
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.json({ "Honc!": "🪿" });
});

app.get("/api/strava", (c) => {
  const mode = c.req.query("hub.mode");
  const token = c.req.query("hub.verify_token");
  const challenge = c.req.query("hub.challenge");

  const VERIFY_TOKEN = "HONC";

  //if (mode && token) {
  //if (mode === 'subscribe' && token === VERIFY_TOKEN) {

  if (token === VERIFY_TOKEN) {
    if (mode === "subscribe") {
      console.log("WEBHOOK_VERIFIED");
    }
    //return c.json({"hub.challenge": challenge});
    return new Response(JSON.stringify({ "hub.challenge": challenge }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  return c.json("Verification failed", 403);
});

app.post("/api/strava", async (c) => {
  const body = c.req.json();
  console.log(body);
  return c.json(body, 200);
});

export default instrument(app);
// export default {
//   async fetch(request: Request): Promise<Response> {
//     return app.fetch(request)
//   },
// } satisfies ExportedHandler
