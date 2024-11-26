import { createClient } from "@libsql/client";
import {
  drizzle as drizzleLibsql,
  type LibSQLDatabase,
} from "drizzle-orm/libsql";
import {
  type AsyncBatchRemoteCallback,
  type AsyncRemoteCallback,
  drizzle as drizzleSQLiteProxy,
  type SqliteRemoteDatabase,
} from "drizzle-orm/sqlite-proxy";

import * as schema from "../../src/db/schema";
import { getLocalD1DBPath } from "../../src/db/utils";
import * as seedData from "./data";
import { config } from "dotenv";
import { SQLiteColumn, SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";
import { ColumnBaseConfig } from "drizzle-orm/column";
import { ColumnDataType } from "drizzle-orm/column-builder";

// biome-ignore lint/suspicious/noExplicitAny: Centralize usage of `any` type (we use it in db results that are not worth typing)
type Any = any;

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

    // A conservative batch size to avoid hitting Cloudflare D1's variable limits
    // NOTE - I tried 50 and 100, but they both hit the limit
    const batchSize = 10;

    // Helper function to insert data in chunks
    // We do this because Cloudflare D1 has a restriction on the number of SQL variables you can use in a single query,
    // and we bumped into that for production seeding
    const insertInChunks = async <T>(table: Any, data: T[]) => {
      const chunks = chunkArray(data, batchSize);
      for (const chunk of chunks) {
        await db.insert(table).values(chunk);
      }
    };

    await insertInChunks(schema.gaggles, seedData.gaggles);
    console.log("HONC! Seeded gaggles");
    await insertInChunks(schema.geese, seedData.geese);
    console.log("HONC! Seeded geese");
    await insertInChunks(schema.honks, seedData.honks);
    console.log("HONC! Seeded honks");

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
  /**
   * Executes a single query against the Cloudflare D1 HTTP API.
   *
   * @param {string} accountId - Cloudflare account ID
   * @param {string} databaseId - D1 database ID
   * @param {string} apiToken - Cloudflare API token with write access to D1
   * @param {string} sql - The SQL statement to execute
   * @param {any[]} params - Parameters for the SQL statement
   * @param {string} method - The method type for the SQL operation
   * @returns {Promise<{ rows: any[][] }>} The result rows from the query
   * @throws {Error} If the HTTP request fails or returns an error
   */
  async function executeCloudflareD1Query(
    accountId: string,
    databaseId: string,
    apiToken: string,
    sql: string,
    params: Any[],
    method: string,
  ): Promise<{ rows: Any[][] }> {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params, method }),
    });

    const data: Any = await res.json();

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

    return { rows: qResult.results.map((r: Any) => Object.values(r)) };
  }

  /**
   * Asynchronously executes a single query.
   */
  const queryClient: AsyncRemoteCallback = async (sql, params, method) => {
    return executeCloudflareD1Query(
      accountId,
      databaseId,
      apiToken,
      sql,
      params,
      method,
    );
  };

  /**
   * Asynchronously executes a batch of queries.
   */
  const batchQueryClient: AsyncBatchRemoteCallback = async (queries) => {
    const results: { rows: Any[][] }[] = [];

    for (const query of queries) {
      const { sql, params, method } = query;
      const result = await executeCloudflareD1Query(
        accountId,
        databaseId,
        apiToken,
        sql,
        params,
        method,
      );
      results.push(result);
    }

    return results;
  };

  return drizzleSQLiteProxy(queryClient, batchQueryClient, DB_CONFIG);
}

/**
 * Splits an array into smaller chunks.
 * @param {T[]} array - The array to split.
 * @param {number} size - The maximum size of each chunk.
 * @returns {T[][]} An array of chunks.
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}
