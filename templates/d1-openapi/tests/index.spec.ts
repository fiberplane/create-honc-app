import { env } from "cloudflare:test";
import { testClient } from 'hono/testing'
import { describe, it, expect, beforeAll } from "vitest";

import app from "../src";

const client = testClient(app, env);

const DATE_REGEX = /^\d{4}-[01]\d-[0-3]\d\s[0-2]\d:[0-5]\d:[0-5]\d$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/

describe("Index", () => {
  it("Returns landing text", async () => {
    const response = await client.index.$get();
    expect(response.status).toBe(200);

    const data = await response.text();
    expect(data).toBe("Honc from above! ☁️🪿");
  })
});

describe("Get all users", () => {
  beforeAll(async () => {
    /**
     * By default, operations against test databases are
     * isolated to each test case. Seeding the database before
     * tests woud be a nice enhancement, but isn't simple
     */
    const mockUserData = {
      name: "Goose Lightning",
      email: "glightning@honc.dev",
    }

    await client.api.users.$post({
      json: mockUserData,
    });
  });

  it("Returns an an array of users", async () => {
    const response = await client.api.users.$get();
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toEqual(expect.any(Array));

    expect(data.length).toBeGreaterThan(0);

    data.forEach((user) => {
      expect(user).toEqual({
        id: expect.stringMatching(UUID_REGEX),
        createdAt: expect.stringMatching(DATE_REGEX),
        updatedAt: expect.stringMatching(DATE_REGEX),
        name: expect.any(String),
        email: expect.any(String),
      });
    });
  });
});

describe("Create User", () => {
  it("Returns an error if no User Data is sent", async () => {
    // Casting used only to pass invalid argument
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
    expect(newUser).toEqual({
      id: expect.stringMatching(UUID_REGEX),
      createdAt: expect.stringMatching(DATE_REGEX),
      updatedAt: expect.stringMatching(DATE_REGEX),
      ...mockUserData
    });
    /** 
     * Since data isn't persisted between conditions,
     * we confirm the write here
     */
    const getResponse = await client.api.users.$get();
    expect(getResponse.status).toBe(200);

    const data = await getResponse.json();
    expect(data).toContainEqual({
      id: newUser.id,
      createdAt: expect.stringMatching(DATE_REGEX),
      updatedAt: expect.stringMatching(DATE_REGEX),
      ...mockUserData
    });
  });
});