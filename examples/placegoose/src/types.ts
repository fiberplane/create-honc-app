import type { DrizzleD1Database } from "drizzle-orm/d1";

export type DatabaseBindings = {
  DB: D1Database;
};

export type DrizzleClient = DrizzleD1Database<Record<string, never>> & {
  $client: D1Database;
};
