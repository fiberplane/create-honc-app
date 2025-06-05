import { type PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import { createMiddleware } from "hono/factory";
import postgres from "postgres";

export const dbProvider = createMiddleware<{
  Bindings: {
    DATABASE_URL: string;
  };
  Variables: {
    db: PostgresJsDatabase;
  };
}>(async (c, next) => {
  const client = postgres(c.env.DATABASE_URL);
  const db = drizzle(client, {
    casing: "snake_case",
  });

  c.set("db", db);
  await next();
});
