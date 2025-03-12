import type { DrizzleD1Database } from "drizzle-orm/d1";

// Create a typed Hono app
type Bindings = {
  DB: D1Database;
};

type Variables = {
  db: DrizzleD1Database;
};

export type AppType = { Bindings: Bindings; Variables: Variables };
