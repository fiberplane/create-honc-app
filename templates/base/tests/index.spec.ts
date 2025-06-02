import { env } from "cloudflare:test";
import { testClient } from 'hono/testing'
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";

import app from "../src";
import { createTestBranch, deleteBranch } from "./setup";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const client = testClient(app, env);

const DATE_REGEX = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d{3}Z$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

describe("Index", () => {
  it("Returns landing text", async () => {
    const response = await client.index.$get();
    expect(response.status).toBe(200);

    const data = await response.text();
    expect(data).toBe("Honc from above! ☁️🪿");
  })
});

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
  })

});

afterAll(async () => {
  deleteBranch(testBranchId);
})

describe("Get all users", () => {
  it("Returns an an array of users", async () => {
    const response = await client.api.users.$get();
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toEqual(expect.any(Array));
    expect(data.length).toBeGreaterThan(0);

    for (const user of data) {
      expect(user).toEqual({
        id: expect.stringMatching(UUID_REGEX),
        createdAt: expect.stringMatching(DATE_REGEX),
        updatedAt: expect.stringMatching(DATE_REGEX),
        settings: expect.any(Object),
        name: expect.any(String),
        email: expect.any(String),
      });
    }

  });
});

let newUserId: string;

describe("Create User", () => {
  it("Returns an error if no User Data is sent", async () => {
    // biome-ignore lint/suspicious/noExplicitAny: Casting used only to pass invalid argument
    const response = await client.api.users.$post(undefined as any);
    expect(response.status).toBe(400);
  });

  it("Inserts and returns a User if payload is valid", async () => {
    const mockUserData = {
      name: "Wingbert Wigglefeather",
      email: "wwigglefeather@honc.dev",
    };

    const postResponse = await client.api.users.$post({
      json: mockUserData
    });

    expect(postResponse.status).toBe(201);

    const newUser = await postResponse.json();
    newUserId = newUser.id;
    expect(newUser).toEqual({
      id: expect.stringMatching(UUID_REGEX),
      createdAt: expect.stringMatching(DATE_REGEX),
      updatedAt: expect.stringMatching(DATE_REGEX),
      settings: expect.any(Object),
      ...mockUserData
    });
    /** 
     * Since data isn't persisted between conditions,
     * we confirm the write here
     */
    const getResponse = await client.api.users[":id"].$get({
      param: { id: newUserId }
    });
    expect(getResponse.status).toBe(200);

    const data = await getResponse.json();
    expect(data).toEqual({
      id: newUser.id,
      createdAt: expect.stringMatching(DATE_REGEX),
      updatedAt: expect.stringMatching(DATE_REGEX),
      settings: expect.any(Object),
      ...mockUserData
    });
  });

  it("Delete User", async () => {
    const response = await client.api.users[":id"].$delete({
      param: { id: newUserId },
    });

    expect(response.status).toBe(204);
  });
});