import { createClient } from "@libsql/client";
import {
  drizzle as drizzleLibsql,
  type LibSQLDatabase,
} from "drizzle-orm/libsql";
import {
  drizzle as drizzleSQLiteProxy,
  type SqliteRemoteDatabase,
} from "drizzle-orm/sqlite-proxy";

import * as schema from "../../src/db/schema";
import { getLocalD1DBPath } from "../../src/db/utils";
import * as seedData from "./data";
import { config } from "dotenv";

// Ensure database clients expect snake_case column names
const DB_CONFIG = {
  casing: "snake_case" as const,
};

seedDatabase();

/**
 * Main function to seed the database with initial data.
 * Determines whether to seed local or production database based on environment,
 * then inserts seed data for gaggles, geese, and honks.
 */
async function seedDatabase() {
  try {
    let db:
      | LibSQLDatabase<Record<string, never>>
      | SqliteRemoteDatabase<Record<string, never>>;

    if (process.env.ENVIRONMENT === "production") {
      console.warn("Using production D1 database");
      db = await seedProductionDatabase();
    } else {
      console.log("Using local D1 database");
      db = await seedLocalDatabase();
    }

    console.log("Seeding database...");

    await db.batch([
      db.insert(schema.gaggles).values(seedData.gaggles),
      db.insert(schema.geese).values(seedData.geese),
      db.insert(schema.honks).values(seedData.honks),
    ]);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

/**
 * Creates a connection to the local D1 SQLite database and returns a Drizzle ORM instance.
 * @returns {Promise<LibSQLDatabase>} Drizzle ORM instance connected to local database
 * @throws {Error} If local database path cannot be resolved
 */
async function seedLocalDatabase(): Promise<
  LibSQLDatabase<Record<string, never>>
> {
  const dbPath = getLocalD1DBPath();

  if (!dbPath) {
    console.error("Database seed failed: local DB could not be resolved");
    process.exit(1);
  }

  const client = createClient({
    url: `file:${dbPath}`,
  });

  return drizzleLibsql(client, DB_CONFIG);
}

/**
 * Creates a connection to the production Cloudflare D1 database and returns a Drizzle ORM instance.
 * Loads production environment variables from .prod.vars file.
 * @returns {Promise<SqliteRemoteDatabase>} Drizzle ORM instance connected to production database
 * @throws {Error} If required environment variables are not set
 */
async function seedProductionDatabase(): Promise<
  SqliteRemoteDatabase<Record<string, never>>
> {
  config({ path: ".prod.vars" });

  const apiToken = process.env.CLOUDFLARE_D1_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_DATABASE_ID;

  if (!apiToken || !accountId || !databaseId) {
    console.error(
      "Database seed failed: production environment variables not set (make sure you have a .prod.vars file)",
    );
    process.exit(1);
  }

  return createProductionD1Connection(accountId, databaseId, apiToken);
}

/**
 * Creates a connection to a remote Cloudflare D1 database using the sqlite-proxy driver.
 * @param {string} accountId - Cloudflare account ID
 * @param {string} databaseId - D1 database ID
 * @param {string} apiToken - Cloudflare API token with write access to D1
 * @returns {SqliteRemoteDatabase} Drizzle ORM instance connected to remote database
 */
export function createProductionD1Connection(
  accountId: string,
  databaseId: string,
  apiToken: string,
) {
  return drizzleSQLiteProxy(
    async (sql: string, params: unknown, method: string) => {
      const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql, params, method }),
      });

      // biome-ignore lint/suspicious/noExplicitAny: not worth the time to do type narrowing
      const data: any = await res.json();

      if (res.status !== 200) {
        throw new Error(
          `Error from sqlite proxy server: ${res.status} ${res.statusText}\n${JSON.stringify(data)}`,
        );
      }

      if (data.errors.length > 0 || !data.success) {
        throw new Error(
          `Error from sqlite proxy server: \n${JSON.stringify(data)}}`,
        );
      }

      const qResult = data?.result?.[0];

      if (!qResult?.success) {
        throw new Error(
          `Error from sqlite proxy server: \n${JSON.stringify(data)}`,
        );
      }

      // https://orm.drizzle.team/docs/get-started-sqlite#http-proxy
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      return { rows: qResult.results.map((r: any) => Object.values(r)) };
    },
    DB_CONFIG,
  );
}
