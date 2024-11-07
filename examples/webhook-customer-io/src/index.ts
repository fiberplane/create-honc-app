import { instrument } from "@fiberplane/hono-otel";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Hono } from "hono";
import { users } from "./db/schema";

type Bindings = {
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Honc! 🪿");
});

app.post("/api/signup", async (c) => {
  const {name, email, githubHandle} = await c.req.json();
  console.log(name, email, githubHandle);

  const sql = neon(c.env.DATABASE_URL)
  const db = drizzle(sql);

  await db.insert(users).values({
    name: name,
    email: email, 
    githubHandle: githubHandle
  }).onConflictDoNothing();



  return c.json("new person registered {name}", 200);
});

export default instrument(app);
