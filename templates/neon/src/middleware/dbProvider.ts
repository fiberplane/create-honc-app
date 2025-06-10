import { neon } from "@neondatabase/serverless";
import { type NeonHttpDatabase, drizzle } from "drizzle-orm/neon-http";
import { createMiddleware } from "hono/factory";

export const dbProvider = createMiddleware<{
  Bindings: {
    DATABASE_URL: string;
  };
  Variables: {
    db: NeonHttpDatabase;
  };
}>(async (c, next) => {
  const client = neon(c.env.DATABASE_URL);
  const db = drizzle(client, {
    casing: "snake_case",
  });

  c.set("db", db);
  await next();
});
