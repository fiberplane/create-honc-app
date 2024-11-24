import { drizzle } from "drizzle-orm/d1";

export function getDb(client: D1Database) {
  // Ensure client expects snake_case column names
  return drizzle(client, { casing: "snake_case" });
}
