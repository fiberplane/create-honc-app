import { env } from 'cloudflare:test';
import { drizzle } from "drizzle-orm/neon-http";
import postgres from "postgres";
import { beforeAll, vi } from "vitest";

const TEST_DATABASE_URL = env.TEST_DATABASE_URL;
if (!TEST_DATABASE_URL) {
  throw new Error("Missing Environment Variable: TEST_DATABASE_URL");
}

beforeAll(async () => {
  vi.mock("../src/db", () => {
    return {
      getDb: () => {
        const db = drizzle(postgres(TEST_DATABASE_URL), {
          casing: "snake_case",
        });
        return db;
      }
    }
  });
});
