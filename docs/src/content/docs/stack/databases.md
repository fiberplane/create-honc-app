---
title: Databases
description: Long-term persistence on the edge.
---

When deploying on the edge, databases have an outsized impact on app latency. Cloudflare’s edge deployments eliminate cold starts and bring app instances closer to clients around the world, dramatically reducing latency between client and server.

A majority of remote calls are between the server and a database though, so pairing a single centralized database with an edge-deployed app can result in slower response times overall. Edge solutions like Cloudflare also typically use a proprietary runtime, which isn’t necessarily compatible with every database driver or hosting solution.

To take full advantage of the Cloudflare’s infrastructure, the HONC stack uses edge-compatible databases like [Cloudflare D1](https://developers.cloudflare.com/d1/), [Neon](https://neon.tech/docs/introduction), and [Supabase](https://supabase.com/docs). These use distributed read replicas to reduce latency, especially as your app scales across regions.

Each of these database solutions comes with its own pros and cons that reflect distinct development priorities and requirements. Here is a brief summary of how they stack up:

|  | **Cloudflare D1** | **Neon** | **Supabase** |
| --- | --- | --- | --- |
| **SQL Flavor** | SQLite | Postgres | Postgres |
| **Connection** | Bindings | HTTP | HTTP |
| **Local Development** | Yes | Using Docker | Using Docker |
| **Read Replicas** | Yes | Yes | Yes |
| **Distributed Write DBs** | With custom infra | No | No |
| **Transactions** | No | Yes | With [Database Functions](https://supabase.com/docs/guides/database/functions) |
| **Pricing** | [By storage + usage](https://developers.cloudflare.com/d1/platform/pricing/) | [By storage + compute](https://neon.com/pricing) | [By storage + bandwidth](https://supabase.com/pricing) |

To learn more about each option, you can take a look at our dedicated introduction to each, but we recommend reviewing the official docs before making a decision.

## Cloudflare D1

[Cloudflare’s (SQLite) D1 database](https://developers.cloudflare.com/d1/) is the easiest to integrate with a HONC app, especially when it comes to local development and testing. In many cases it will also be the most scalable and performant option, since [D1 read replicas are automatically deployed](https://blog.cloudflare.com/making-full-stack-easier-d1-ga-hyperdrive-queues/) to minimize latency.

There are a few gotchas to be aware of though. D1 is designed for a per-tenant architecture, but there is no default implementation, so scaling D1 write databases requires carefully-planned custom infrastructure. There is also [no current or planned support for transactions](https://github.com/cloudflare/workers-sdk/issues/2733#issuecomment-2712365336), though a similar effect can be achieved with [batches](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch) or [Durable Objects](https://developers.cloudflare.com/durable-objects/what-are-durable-objects/).

### Getting Started

The HONC D1 templates are already configured for a D1 database connection, so start developing locally you just need to run `db:setup`. This will:

1. Create a local D1 database.
2. Generate and apply migrations from the Drizzle schema.
3. Seed the database using `drizzle-seed`.

If you already have an initial database architecture in mind, be sure to update the schema before running `db:setup`. You can always make changes later though, so feel free to spin up the database as-is if you want to explore our example app first.

> Local database files are stored in `.wrangler`, and migration files will be saved to `/drizzle/migrations`. Re-starting from scratch is as simple as deleting both of these.
> 

### Accessing D1 bindings in-app

Once the database is set up, you can access it throughout your Hono app via [Cloudflare’s bindings](https://developers.cloudflare.com/d1/worker-api/). These use the configuration in your `wrangler.toml` file to establish a database connection scoped to each request.

> Bindings are *not* available in the global scope, which is why the templates use an HTTP connection for remote database setup and seeding.
> 

[Hono exposes bindings](https://hono.dev/docs/getting-started/cloudflare-workers#bindings) via the [`env` property on the request `Context` object](https://hono.dev/docs/api/context#env). To keep `Context` typing in sync with your bindings, you can pass the `Bindings` types as a generic to Hono app instances or middleware.

In the interest of clarity, HONC templates do so manually, but this can be fragile. A more type-safe approach is to run `wrangler types`, which generates a global `Env` type based on your `wrangler.toml`. If you choose this approach, remember to re-run the command each time you update the configuration!

> Cloudflare’s `Env` type shouldn’t be confused with Hono’s `Env`, which is the first generic argument that Hono instances and middleware accept.
> 

Here is a simple example of Cloudflare bindings and Hono types in action. When properly typed, the D1 binding can be passed directly to the Drizzle client to type-safely construct queries.

```tsx
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema";

type AppEnv = {
  Bindings: { DB: D1Database }
  // The Env type is available globally after running `wrangler types`
  // Bindings: Env;
}

const app = new Hono<AppEnv>()
	.get("/api/users", async (c) => {
	  const db = drizzle(c.env.DB);
	  
	  const users = await db.select().from(schema.users);
	  return c.json({ users });
	});
```

In practice though, it’s recommended to initialize the Drizzle client in a dedicated middleware. This makes it easier to keep configurations in sync, and simplifies typing by leveraging Hono’s type inference in handlers.

### Creating a remote database

A local D1 database is sufficient for early development and testing, but eventually you’ll want to deploy your app to Cloudflare’s global network. Before doing so, it’s necessary to make all bindings your Worker depends on available remotely.

You can set up a remote D1 database in a few simple steps:

1. [Create the database](https://developers.cloudflare.com/d1/get-started/#2-create-a-database) using the [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/commands/) or through your Cloudflare dashboard. The HONC templates use the CLI because it’s more transparent and reproducible, but either approach is valid.
    
    ```bash
    wrangler d1 create <DATABASE_NAME>
    ```
    
2. Update your `wrangler.toml` with the `DATABASE_NAME` you used, and the `DATABASE_ID` logged by the CLI (or made available in the dashboard).
    
    ```toml
    [[d1_databases]]
    binding = "DB"
    database_name = "<DATABASE_NAME>"
    database_id = "<DATABASE_ID>"
    migrations_dir = "drizzle/migrations"
    ```
    
3. Apply your migrations by running `db:migrate:prod`, which executes the `drizzle-kit migrate` command. The `ENVIRONMENT` variable is set to ensure that the production Drizzle config (`drizzle.config.ts`) is used.
    
    ```bash
    npm run ENVIRONMENT=production drizzle-kit migrate
    ```
    

That’s it! Your database is now live. If you don’t have any other remote bindings to create, the next step is to deploy your Worker so you can start making calls to your remote D1.

## Neon

[Neon is a fully-managed Postgres platform](https://neon.com/docs/introduction) that prioritizes performance and user experience. Its separation of compute and storage is a key differentiator, allowing each to be scaled separately. It offers features like auto-scaling, read replicas, and database branching so that you can focus on developing your app instead of building infrastructure.

Its quality-of-life features, free database branching, and native support for database transactions make it a great option—especially if Postgres is a requirement. Going outside the Cloudflare ecosystem may introduce some additional latency though, especially since it makes colocating databases with Workers more difficult.

> Cloudflare’s [Hyperdrive](https://developers.cloudflare.com/hyperdrive/) can mitigate some of this latency by pooling connections and caching common query results.
>

### Getting Started

Since Neon databases run on proprietary infrastructure independent of the Cloudflare ecosystem, [local development with Neon](https://neon.tech/guides/local-development-with-neon) requires [Docker](https://www.docker.com/get-started/) to set up a local Postgres database and the Neon proxy.

For simplicity, the HONC templates connect directly to a remote Neon database instead. To keep development or test data separate from your production database, you can use [database branches](https://neon.com/docs/introduction/branching), which are essentially copies of your primary database.

Branches can be easily [managed via REST API](https://neon.com/docs/guides/branching-neon-api). The templates use this approach to spin up temporary branches when running tests, but a similar approach could be used to create an isolated database branch for development.

### Connecting to a Neon database

To [connect to both local and remote Neon databases](https://orm.drizzle.team/docs/connect-neon), first pass the database URL to the Neon driver, then pass that to the Drizzle client. Since the database URL contains sensitive credentials, you must store it in your Worker’s environment secrets to prevent leaks.

Secrets can be [set for local development](https://developers.cloudflare.com/workers/local-development/environment-variables/) using a `.dev.vars` file, but must be [added separately for deployed Workers](https://developers.cloudflare.com/workers/configuration/secrets/#adding-secrets-to-your-project) using the CLI or through the dashboard. Cloudflare automatically exposes secrets and any other environment variables through the bindings API.

[Hono exposes bindings](https://hono.dev/docs/getting-started/cloudflare-workers#bindings) via the [`env` property on the request `Context` object](https://hono.dev/docs/api/context#env). To keep `Context` typing in sync with your bindings, you can pass the `Bindings` types as a generic to Hono app instances or middleware.

In the interest of clarity, HONC templates do so manually, but this can be fragile. A more type-safe approach is to run `wrangler types`, which generates a global `Env` type based on your `.dev.vars` file (and `wrangler.toml`). If you choose this approach though, remember to re-run the command each time you add or modify secrets!

> Cloudflare’s `Env` type shouldn’t be confused with Hono’s `Env`, which is the first generic argument that Hono instances and middleware accept.
> 

Here is a simple example of Cloudflare secrets and Hono types in action. When properly typed, the `DATABASE_URL` variable can be passed directly to the Neon driver.

```tsx
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./db/schema";

type AppEnv = {
  Bindings: { DATABASE_URL: string }
  // The Env type is available globally after running `wrangler types`
  // Bindings: Env;
}

const app = new Hono<AppEnv>()
	.get("/api/users", async (c) => {
	  const driver = neon(c.env.DATABASE_URL);
	  const db = drizzle(driver);
	  
	  const users = await db.select().from(schema.users);
	  return c.json({ users });
	});
```

In practice though, it’s recommended to initialize the Drizzle client in a dedicated middleware. This makes it easier to keep configurations in sync, and simplifies typing by leveraging Hono’s type inference in handlers.

That’s it! Your database is now live. The next step is to deploy your Worker so you can start making calls to your remote database.

## Supabase

Supabase is a [comprehensive Postgres development platform](https://supabase.com/database). In addition to a managed database, it also provides storage, a user management system, edge functions, and a real-time client. This makes Supabase a great alternative to Firestore, but also means that it has a pricing and development model that may be sub-optimal if you just need a database.

Two notable limitations are that Supabase doesn’t offer free branching, and transactions are only supported via [Database Functions](https://supabase.com/docs/guides/database/functions). Going outside the Cloudflare ecosystem may also introduce some additional latency, especially since it makes colocating databases with Workers more difficult.

> Cloudflare’s [Hyperdrive](https://developers.cloudflare.com/hyperdrive/) can mitigate some of this latency by pooling connections and caching common query results.
>

### Getting Started

Since Supabase runs on proprietary infrastructure independent of the Cloudflare ecosystem, you must use the [Supabase CLI](https://supabase.com/docs/guides/local-development) and [Docker](https://www.docker.com/get-started/) to run a database locally.

For simplicity, the HONC templates connect directly to a remote Supabase database instead. To keep development or test data separate from your production database, you can use [database branches](https://supabase.com/docs/guides/deployment/branching), which are essentially copies of your primary database.

> At this time, Supabase branching is only available on the [Pro tier](https://supabase.com/pricing), so the HONC templates don’t actively make use of branches.
> 

Branches can be easily [managed via REST API](https://api.supabase.com/api/v1#tag/environments/post/v1/projects/{ref}/branches). The templates include an example demonstrating how to spin up temporary branches when running tests, but a similar approach could be used to create an isolated database branch for development.

### Connecting to a Supabase database

To [connect to both local and remote Supabase databases](https://orm.drizzle.team/docs/tutorials/drizzle-with-supabase#connect-drizzle-orm-to-your-database), first pass the database URL to the Supabase driver, then pass that to the Drizzle client. Since the database URL contains sensitive credentials, you must store it in your Worker’s environment secrets to prevent leaks.

Secrets can be [set for local development](https://developers.cloudflare.com/workers/local-development/environment-variables/) using a `.dev.vars` file, but must be [added separately for deployed Workers](https://developers.cloudflare.com/workers/configuration/secrets/#adding-secrets-to-your-project) using the CLI or through the dashboard. Cloudflare automatically exposes secrets and any other environment variables through the bindings API.

[Hono exposes bindings](https://hono.dev/docs/getting-started/cloudflare-workers#bindings) via the [`env` property on the request `Context` object](https://hono.dev/docs/api/context#env). To keep `Context` typing in sync with your bindings, you can pass the `Bindings` types as a generic to Hono app instances or middleware.

In the interest of clarity, HONC templates do so manually, but this can be fragile. A more type-safe approach is to run `wrangler types`, which generates a global `Env` type based on your `.dev.vars` file (and `wrangler.toml`). If you choose this approach though, remember to re-run the command each time you add or modify secrets!

> Cloudflare’s `Env` type shouldn’t be confused with Hono’s `Env`, which is the first generic argument that Hono instances and middleware accept.
> 

Here is a simple example of Cloudflare secrets and Hono types in action. When properly typed, the `DATABASE_URL` variable can be passed directly to the Supabase driver.

```tsx
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./db/schema";

type AppEnv = {
  Bindings: { DATABASE_URL: string }
  // The Env type is available globally after running `wrangler types`
  // Bindings: Env;
}

const app = new Hono<AppEnv>()
	.get("/api/users", async (c) => {
	  const driver = postgres(c.env.DATABASE_URL);
	  const db = drizzle(driver);
	  
	  const users = await db.select().from(schema.users);
	  return c.json({ users });
	});
```

In practice though, it’s recommended to initialize the Drizzle client in a dedicated middleware. This makes it easier to keep configurations in sync, and simplifies typing by leveraging Hono’s type inference in handlers.

That’s it! Your database is now live. The next step is to deploy your Worker so you can start making calls to your remote database.