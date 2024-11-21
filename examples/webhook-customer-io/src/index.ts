import { instrument } from "@fiberplane/hono-otel";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Hono } from "hono";
import { users } from "./db/schema";
import { authenticationMiddleware } from "./middleware/authentication-middleware";
import {validateInputMiddleware} from "./middleware/validate-input-middleware";

type Bindings = {
  DATABASE_URL: string;
  SLACK_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("/api/signup", authenticationMiddleware, validateInputMiddleware);


app.get("/", (c) => {
  return c.text("Honc! 🪿");
});

app.post("/api/signup", async (c) => {
  const {name, email, githubHandle} = await c.req.json();

  c.executionCtx.waitUntil(sendSlackMessage(`New person registered: ${name}`, c.env.SLACK_URL));
  
  await insertDb(name, email, githubHandle, c.env.DATABASE_URL);
  return c.json(`new person registered ${name}`, 200);
});


export async function insertDb(name: string, email: string, githubHandle: string, dbUrl: string) {
  const sql = neon(dbUrl);
  const db = drizzle(sql);

  await db.insert(users).values({
    name: name,
    email: email,
    githubHandle: githubHandle
  }).onConflictDoNothing();

}

export  async function sendSlackMessage(message: string, slackUrl: string) {
  
  await fetch(slackUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: message,
    }),
  });
}

export default instrument(app);
