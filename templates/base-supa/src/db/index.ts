import { drizzle } from "drizzle-orm/neon-http";
import postgres from "postgres";

export const getDb = (databaseUrl: string) => {
  const client = postgres(databaseUrl);
  const db = drizzle(client, {
    casing: "snake_case",
  });

  return db;
};