import { drizzle } from "drizzle-orm/d1";

export function getDb(client: D1Database) {
  return drizzle(client, { casing: "snake_case" });
}
