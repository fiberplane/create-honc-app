import { env } from "cloudflare:test";
import { drizzle } from "drizzle-orm/neon-http";
import { createMiddleware } from "hono/factory";
import postgres from "postgres";
import { beforeAll, vi } from "vitest";

/**
 * Mock the database provider middleware so that
 * tests don't affect the primary database(s).
 */

const TEST_DATABASE_URL = env.TEST_DATABASE_URL;
if (!TEST_DATABASE_URL) {
  throw new Error("Missing Environment Variable: TEST_DATABASE_URL");
}

beforeAll(async () => {
  vi.mock("../src/middleware/dbProvider.ts", () => {
    return {
      dbProvider: createMiddleware(async (c, next) => {
        const db = drizzle(postgres(TEST_DATABASE_URL), {
          casing: "snake_case",
        });

        c.set("db", db);
        await next();
      }),
    };
  });
});
