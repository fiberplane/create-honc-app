import { drizzle } from "drizzle-orm/d1";
import type * as schema from "./schema";

export function getDb(client: D1Database) {
  // Ensure client expects snake_case column names
  return drizzle<typeof schema>(client, { casing: "snake_case" });
}
