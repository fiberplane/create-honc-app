---
title: Drizzle
description: Enabling type-safe communication between database and business logic.
---

[Drizzle](https://orm.drizzle.team/docs/overview) is a lightweight (0 dependencies) edge-compatible TypeScript ORM. It strives for a SQL-in-TS developer experience, which means queries read like SQL, while still offering fairly comprehensive type safety.

Like Prisma, Drizzle takes a schema-first approach. Table definitions are the single source of truth at both compile- and run-time. To keep validation and other adapters in sync, Drizzle offers integrations with popular validation libraries—most of which are also compatible with Hono.

> Note: While it's substantially more performant that Prisma by some benchmarks, Drizzle's approach leaves some typing logic gaps that Prisma avoids by generating database types.

The Drizzle Kit development dependency adds tooling that manages databas setup, migrations, and seeding. It also comes with a studio that can be used to inspect both local and remote databases.

## Schema

Drizzle's type system is built around the database schema, which serves as the single source of truth. This is conventionally defined in a `schema` file (or directory), using database-specific helpers. The schema is then used by `drizzle-kit` to generate migrations, and by the client when building queries.

Table definitions optionally accept a third argument—a callback returning an array—that can be used to describe indices and constraints.

```typescript
import crypto from "node:crypto";
import { sql } from "drizzle-orm";
import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    // .primaryKey() must be chained before $defaultFn
    id: text().primaryKey().$defaultFn(crypto.randomUUID),
    name: text().notNull(),
    email: text().notNull(),
    createdAt: text().notNull().default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text().notNull().default(sql`(CURRENT_TIMESTAMP)`),
  },
  /**
   * Ensure case-insensitive uniqueness for email
   * @see https://orm.drizzle.team/docs/guides/unique-case-insensitive-email#sqlite
   */
  (table) => [uniqueIndex("emailUniqueIndex").on(sql`lower(${table.email})`)],
);
```

## Types and Validation

Table definitions expose default row types via `$inferInsert` and `$inferSelect`, and corresponding validation schemas can be generated using one of Drizzle's validator integration packages (e.g., `drizzle-zod`).

The validation helpers take an optional second argument that can be used to extend or override the generated validation schemas.

```typescript
import { createSelectSchema } from "drizzle-zod";
import type * as schema from "./schema";

type UserSelect = schema.users.$inferSelect;

const ZUserSelect = createSelectSchema(schema.users, {
  email: (schema) => schema.email(),
  createdAt: (schema) => schema.transform((string) => new Date(string)),
  updatedAt: (schema) => schema.transform((string) => new Date(string)),
});
```

## Client

Database calls (during runtime and when seeding) are handled by the Drizzle client, which is also responsible for generating the underlying SQL queries.

The `casing` option can be used to automatically convert camel case column names in the schema to snake case when reading and writing. Note that this configuration must be set for all client instances, as well as in the `drizzleConfig` used to generate migrations.

```typescript
import { drizzle } from "drizzle-orm/d1";
import type * as schema from "./schema";

const db = drizzle<typeof schema>(client, { casing: "snake_case" });
```

## Config

Database management and migration is configured through a root-level `drizzle.config.ts` file. Remember to include the `casing` option if you plan to use it with the client!

```typescript
export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle/migrations",
    dialect: "sqlite",
    driver: "d1-http",
    casing: "snake_case",
    dbCredentials: {
      // url: "local-database.url",
      accountId: CLOUDFLARE_ACCOUNT_ID,
      databaseId: CLOUDFLARE_DATABASE_ID,
      token: CLOUDFLARE_D1_TOKEN,
    },
  });
```

