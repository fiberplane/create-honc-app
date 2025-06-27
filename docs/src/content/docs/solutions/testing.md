---
title: Testing
description: Validating app logic with Hono's Test Client and Vitest.
sidebar:
  order: 4
---

Testing is a critical step in developing resilient applications and delivering a smooth user experience. It helps flag changes that desynchronize coupled workflows, and can catch bugs before they get deployed to production. It can also feel complex and burdensome though. Tests often need to be updated when business logic is modified, and testing at all requires non-trivial infrastructure of its own.

The HONC stack addresses these challenges by leveraging [Hono’s RPC Test Client](https://hono.dev/docs/helpers/testing), paired with [Cloudflare’s Vitest integration](https://hono.dev/examples/cloudflare-vitest). These tools radically simplify the process of creating and running tests, as well as keeping them up to date as your codebase evolves.

Every HONC template comes with pre-configured testing infrastructure, including a connection to an isolated testing database. Templates also include some example tests that demonstrate the basics of testing with Hono + Cloudflare + Vitest.

This guide explains the template testing setup in greater detail, but you can also use it to add tests to an existing HONC project.

## Setup & Configuration

Before getting started, ensure that your [compatibility date](https://developers.cloudflare.com/workers/configuration/compatibility-dates/) is set to `2022-10-31` or later, and that your Worker is using the ES Modules format.

### Install Vitest and Cloudflare Integration

First install `vitest` and `@cloudflare/vitest-pool-workers` as development dependencies. Note that at this time, the Cloudflare integration only works with Vitest 2.0x - 3.2x. For more information, refer to the [Cloudflare Vitest setup guide](https://developers.cloudflare.com/workers/testing/vitest-integration/write-your-first-test/#prerequisites).

```bash
npm i -D vitest@~3.1.4 @cloudflare/vitest-pool-workers
```

### Configure Vitest

Next, create a `vitest.config.ts` file in your project root, and export the return of `defineWorkersConfig`. Below is the minimal configuration recommended by Cloudflare, which points to your `wrangler.toml` to configure the local test worker. Check out Cloudflare’s [Vitest Configuration docs](https://developers.cloudflare.com/workers/testing/vitest-integration/configuration/) to learn more.

```tsx
import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.toml" },
      },
    },
  },
});
```

When using [Fiberplane’s Studio](https://github.com/fiberplane/fiberplane), we must also instruct Vitest to inline the library and some of its dependencies to [avoid a build error](https://github.com/fiberplane/fiberplane/issues/589).

```tsx
export default defineWorkersConfig({
	test: {
		// ...
	},
	ssr: {
    noExternal: [
      "@sagold/json-pointer",
      "json-schema-library",
      "@fiberplane/hono",
    ],
  },
});
```

### Connect Type Definitions

The Cloudflare Vitest integration supports type-safe access to Cloudflare bindings and environment variables. To access these, first [run `wrangler types`](https://developers.cloudflare.com/workers/wrangler/commands/#types) to generate a `worker-configuration.d.ts` file that exposes configured binding and variable types through a global `Env` type. Then, add an `env.d.ts` file to your `tests` directory to define the environment type made available to your tests.

```tsx
declare module "cloudflare:test" {
  // ProvidedEnv controls the type of `import("cloudflare:test").env`
  interface ProvidedEnv extends Env { }
}
```

You must also update your `tsconfig` to include both `@cloudflare/vitest-pool-workers` and `worker-configuration.d.ts` types.

```tsx
{
  "compilerOptions": {
		// ...
    "types": [
	    // ...
      "@cloudflare/vitest-pool-workers"
    ],
  },
  "include": [
    "./**/*.ts",
    "./**/*.tsx",
    "./worker-configuration.d.ts" // output of `wrangler types`
  ]
}
```

## Isolating Test Database Calls

Naturally, you don’t want tests to affect data in your production database. Mocking database calls brings its own set of problems, and can undermine test effectiveness. Using a test-specific database is a more resilient and scalable solution.

### With Cloudflare D1

The Cloudflare Vitest integration uses [Miniflare](https://developers.cloudflare.com/workers/testing/miniflare/) to simulate the Workers runtime and APIs locally. When using Cloudflare’s D1 database (or other storage products), you can configure the Vitest integration to isolate database access per test. For a complete example, check out [Cloudflare’s D1 testing recipe](https://github.com/cloudflare/workers-sdk/tree/main/fixtures/vitest-pool-workers-examples/d1), or [the HONC D1 template](https://github.com/fiberplane/create-honc-app/tree/main/templates/d1).

Since the test database is fully isolated, migrations (and any seeding) must be applied before tests are run, using a custom setup file. This can be accomplished in a few simple steps:

1. Use the `readD1Migrations` utility to read existing migrations.
2. Configure Miniflare to set up a test database, and set the `migrations` value to a test-only binding.

```tsx
import path from "node:path";
import {
  defineWorkersConfig,
  readD1Migrations,
} from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig(async () => {
  /**
   * Read migrations file to set as test-only environment variable. Used
   * in `/tests/setup.ts` to apply migrations before tests run.
   */
  const migrationsPath = path.join(__dirname, "drizzle/migrations");
  const migrations = await readD1Migrations(migrationsPath);

  return {
    test: {
      setupFiles: ["./tests/setup.ts"],
      poolOptions: {
        workers: {
          miniflare: {
            compatibilityFlags: ["nodejs_compat"],
            compatibilityDate: "2024-04-01",
            d1Databases: ["DB"],
            bindings: { TEST_MIGRATIONS: migrations }, // D1 Only
          },
        },
      },
    },
  };
});
```

1. Update your `tests/env.d.ts` file for type-safe access to the migrations binding in your setup file.

```tsx
declare module "cloudflare:test" {
  // ProvidedEnv controls the type of `import("cloudflare:test").env`
  interface ProvidedEnv extends Env {
    // Set in `vitest.config.ts` each time tests are run
    TEST_MIGRATIONS: D1Migration[];
  }
}
```

1. In a `tests/setup.ts` file, use the `applyD1Migrations` utility to apply migrations to the test database.

```tsx
import { applyD1Migrations, env } from "cloudflare:test";

/**
 * Apply migrations written from file to test-only environment
 * variable in `vitest.config.ts`
 */
await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
```

That’s it for configuration! Skip ahead to learn more about [writing tests with the Hono Test Client](#hono-test-client).

### Other Databases

When using a storage solution outside the Cloudflare ecosystem, it’s necessary to create a dedicated testing database, and add the connection URL to your local environment secrets. To isolate storage on each test run you can use database branches, offered by both Neon and Supabase (Pro tier). 

> Database branches are copies of your testing database that can be spun up and torn down to ensure each test run begins with the same state. Branching from a testing—rather than production—database is recommended to keep production data private and secure.
> 

Both Neon and Supabase templates include examples of how to create and tear down database branches for each test run. Since Supabase branches are a paid feature though, branching is only fully implemented in Neon templates.

Regardless of whether or not you choose to use branches, you’ll need to mock the `dbProvider` middleware to connect to the test database when running tests.

First, create a `tests/setup.ts` file and call Vitest’s `vi.mock` method in a `beforeAll` statement. The `mock` method takes two arguments:

- The path to the module being mocked.
- A callback returning the mocked module.

You can copy the `dbProvider` implementation directly; just remember to update the URL passed to the database driver so that it points to your test databse!

```tsx
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
```

Then simply add the setup file path to your `vitest.config.ts`, and Vitest will automatically execute it before running your tests.

```tsx
export default defineWorkersConfig({
  test: {
    // ...
    setupFiles: ["./tests/setup.ts"],
  },
});
```

## Hono Test Client

Hono’s Test Client works much like its main [RPC Client](https://hono.dev/docs/guides/rpc), making it easy to construct type-safe calls to your backend. Any changes to request data requirements or response types are flagged by the TypeScript server, helping to debug failing tests (or avoid them altogether).

> The Test Client’s type-checking and autocompletion features are only available if [app methods are chained](https://hono.dev/docs/guides/best-practices#if-you-want-to-use-rpc-features).
> 

To use the Test Client, simply call it with the Hono app (or route) instance you want to test. If your app relies on Cloudflare bindings or environment variables, it’s also necessary to pass the `env` object exported by the `cloudflare:test` module. This provides access to a test-specific environment based on your `wrangler.toml` file, including isolated storage.

```tsx
import { env } from "cloudflare:test";
import { testClient } from "hono/testing";
import { describe, expect, it } from "vitest";

import app from "../src";

const client = testClient(app, env);

describe("GET /", () => {
  it("Returns landing text", async () => {
    const response = await client.index.$get();
    expect(response.status).toBe(200);

    const data = await response.text();
    expect(data).toBe("Honc from above! ☁️🪿");
  });
});
```

The Test Client also accepts a [Cloudflare `ExecutionContext`](https://developers.cloudflare.com/workers/runtime-apis/context/) as a third (optional) argument, which you can construct using the helper from the `cloudflare:test` module. This is only necessary if your application relies on the `ExecutionContext` API, e.g., using `waitUntil` to keep your Worker running after returning a response.

```tsx
import { createExecutionContext, env } from "cloudflare:test";
import { testClient } from "hono/testing";

import app from "../src";

const client = testClient(app, env, createExecutionContext());
```

Once you’ve written some tests, run the `test` script to validate your application logic!

```bash
npm run test
```