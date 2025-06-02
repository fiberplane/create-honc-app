import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { beforeAll, afterAll, vi } from "vitest";
import { createTestBranch, deleteBranch } from "./helpers";

const { 
  id: testBranchId, 
  uri: testBranchUri
} = await createTestBranch();

beforeAll(async () => {
  vi.mock("../src/db", () => {
    return {
      getDb: () => {
        const db = drizzle(neon(testBranchUri), {
          casing: "snake_case",
        });
        return db;
      }
    }
  });
});

afterAll(async () => {
  deleteBranch(testBranchId);
});