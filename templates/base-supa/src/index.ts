import { instrument } from "@fiberplane/hono-otel";
import { drizzle } from "drizzle-orm/postgres-js";
import { Hono } from "hono";
import postgres from "postgres";
import { users } from "./db/schema";

type Bindings = {
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Supa Honc! 📯🪿📯🪿📯🪿📯");
});

app.get("/api/users", async (c) => {
  const sql = postgres(c.env.DATABASE_URL);
  const db = drizzle(sql);

  return c.json({
    users: await db.select().from(users),
  });
});

export default instrument(app);
