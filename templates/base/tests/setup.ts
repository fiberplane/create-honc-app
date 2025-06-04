import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { createMiddleware } from "hono/factory";
import { beforeAll, afterAll, vi } from "vitest";
import { createTestBranch, deleteBranch } from "./helpers";

const { 
  id: testBranchId, 
  uri: testBranchUri
} = await createTestBranch();

beforeAll(async () => {
  vi.mock("../src/middleware/dbProvider.ts", () => {
    return {
      dbProvider: createMiddleware(async (c, next) => {
        const db = drizzle(neon(testBranchUri), {
          casing: "snake_case",
        });

        c.set('db', db);
        await next();
      }),
    }
  });
});

afterAll(async () => {
  deleteBranch(testBranchId);
});
