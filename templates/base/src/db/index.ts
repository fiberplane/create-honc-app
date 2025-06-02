import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

export const getDb = (databaseUrl: string) => {
  const client = neon(databaseUrl);
  const db = drizzle(client, {
    casing: "snake_case",
  });

  return db;
};