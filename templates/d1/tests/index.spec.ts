import { env } from "cloudflare:test";
import { testClient } from "hono/testing";
import { beforeAll, describe, expect, it } from "vitest";

import app from "../src";

const client = testClient(app, env);

const DATE_REGEX = /^\d{4}-[01]\d-[0-3]\d\s[0-2]\d:[0-5]\d:[0-5]\d$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/**
 * The Cloudflare + Vitest integration isolates storage for each
 * `describe`, so it's necessary to seed any data that will be
 * queried with `beforeAll`.
 * @see https://developers.cloudflare.com/workers/testing/vitest-integration/
 * @see https://github.com/cloudflare/workers-sdk/tree/main/fixtures/vitest-pool-workers-examples/d1
 */

describe("GET /", () => {
  it("Returns landing text", async () => {
    const response = await client.index.$get();
    expect(response.status).toBe(200);

    const data = await response.text();
    expect(data).toBe("Honc from above! ☁️🪿");
  });
});

describe("GET /users", () => {
  beforeAll(async () => {
    const mockUserData = [
      {
        name: "Wingbert Wigglefeather",
        email: "wwigglefeather@honc.dev",
      },
      {
        name: "Waddles McPaddle",
        email: "wmcpaddle@honc.dev",
      },
      {
        name: "Squawkers O'Quacker",
        email: "soquacker@honc.dev",
      },
    ];

    for (const user of mockUserData) {
      await client.api.users.$post({ json: user });
    }
  });

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
        name: expect.any(String),
        email: expect.any(String),
      });
    }
  });
});

describe("POST /users", () => {
  it("Returns 400 if payload is undefined", async () => {
    // biome-ignore lint/suspicious/noExplicitAny: Casting used only to pass invalid argument
    const response = await client.api.users.$post(undefined as any);
    expect(response.status).toBe(400);
  });

  it("Returns 201 and new User if payload is valid", async () => {
    const mockUserData = {
      name: "Wingbert Wigglefeather",
      email: "wwigglefeather@honc.dev",
    };

    const response = await client.api.users.$post({
      json: mockUserData,
    });

    expect(response.status).toBe(201);

    const newUser = await response.json();
    expect(newUser).toEqual({
      id: expect.stringMatching(UUID_REGEX),
      createdAt: expect.stringMatching(DATE_REGEX),
      updatedAt: expect.stringMatching(DATE_REGEX),
      ...mockUserData,
    });
  });
});

describe("GET /users/:id", () => {
  let NEW_USER_ID: string;

  beforeAll(async () => {
    const mockUserData = {
      name: "Wingbert Wigglefeather",
      email: "wwigglefeather@honc.dev",
    };

    const response = await client.api.users.$post({
      json: mockUserData,
    });

    const { id } = await response.json();
    NEW_USER_ID = id;
  });

  it("Returns 200 and User matching valid ID", async () => {
    const response = await client.api.users[":id"].$get({
      param: { id: NEW_USER_ID },
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual({
      id: NEW_USER_ID,
      createdAt: expect.stringMatching(DATE_REGEX),
      updatedAt: expect.stringMatching(DATE_REGEX),
      name: expect.any(String),
      email: expect.any(String),
    });
  });
});

describe("DELETE /users/:id", () => {
  let NEW_USER_ID: string;

  beforeAll(async () => {
    const mockUserData = {
      name: "Wingbert Wigglefeather",
      email: "wwigglefeather@honc.dev",
    };

    const response = await client.api.users.$post({
      json: mockUserData,
    });

    const { id } = await response.json();
    NEW_USER_ID = id;
  });

  it("Returns 204 after deleting User matching valid ID", async () => {
    const response = await client.api.users[":id"].$delete({
      param: { id: NEW_USER_ID },
    });

    expect(response.status).toBe(204);

    const confirmation = await client.api.users[":id"].$get({
      param: { id: NEW_USER_ID },
    });

    expect(confirmation.status).toBe(404);
  });
});
