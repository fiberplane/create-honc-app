import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import { createMiddleware } from "hono/factory";

export const dbProvider = createMiddleware<{
  Bindings: {
    DB: D1Database;
  };
  Variables: {
    db: DrizzleD1Database;
  };
}>(async (c, next) => {
  const db = drizzle(c.env.DB, {
    casing: "snake_case",
  });

  c.set("db", db);
  await next();
});
