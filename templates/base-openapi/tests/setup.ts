import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { createMiddleware } from "hono/factory";
import { afterAll, beforeAll, vi } from "vitest";
import { createTestBranch, deleteBranch } from "./helpers";

/**
 * Create a temporary test branch, and mock the database provider
 * middleware so that tests don't affect the primary database(s).
 */

const { id: testBranchId, uri: testBranchUri } = await createTestBranch();

beforeAll(async () => {
  vi.mock("../src/middleware/dbProvider.ts", () => {
    return {
      dbProvider: createMiddleware(async (c, next) => {
        const db = drizzle(neon(testBranchUri), {
          casing: "snake_case",
        });

        c.set("db", db);
        await next();
      }),
    };
  });
});

afterAll(async () => {
  deleteBranch(testBranchId);
});
