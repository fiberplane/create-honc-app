import { config } from "dotenv";
import type { BatchItem } from "drizzle-orm/batch";
import {
  drizzle as drizzleLibsql,
  type LibSQLDatabase,
} from "drizzle-orm/libsql";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import {
  type AsyncBatchRemoteCallback,
  drizzle as drizzleSQLiteProxy,
  type SqliteRemoteDatabase,
} from "drizzle-orm/sqlite-proxy";
import { createClient } from "@libsql/client";

import * as schema from "../../src/db/schema";
import { getLocalSQLiteDBPath } from "../../src/db/utils";
import * as seedData from "./data";


// Ensure database clients expect snake_case column names
const DB_CONFIG = {
  casing: "snake_case",
} as const;

seedDatabase();

/**
 * Main function to seed the database with initial data.
 * Determines whether to seed local or production database based on environment,
 * then inserts seed data for gaggles, geese, and honks.
 */
async function seedDatabase() {
  try {
    const db = process.env.ENVIRONMENT === "production"
      ? await getProductionDatabase()
      : await getLocalDatabase();

    console.log("Seeding database...");

    /**
     * Helper function to insert data in chunks
     * Cloudflare allows a maximum of 100 bound variables per query
     * @see https://developers.cloudflare.com/d1/platform/limits/
     * 
     */
    const chunkInserts = <T extends SQLiteTable>(table: T, data: T["$inferInsert"][], batchSize: number) => {
      const dataChunks = chunkArray(data, batchSize);

      // Initialize the array with the first insert to
      // satisfy the tuple type requirement
      const chunkedInserts: [BatchItem<"sqlite">, ...BatchItem<"sqlite">[]] = [
        db.insert(table).values(dataChunks[0])
      ];

      // Loop starts at 1 as we've already added 0
      for (let i = 1; i < dataChunks.length; i++) {
        chunkedInserts.push(db.insert(table).values(dataChunks[i]));
      }

      return chunkedInserts;
    }

    // Batch writes to insert in transaction
    await db.batch([
      ...chunkInserts(schema.gaggles, seedData.gaggles, 33),
      ...chunkInserts(schema.geese, seedData.geese, 20),
      ...chunkInserts(schema.honks, seedData.honks, 33),
    ]);

    console.log("Database seeded successfully!");
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Database Seed Failed: ${error.message}`);
    }
    console.error(error);
    process.exit(1);
  }
}

/**
 * Creates a connection to the local D1 SQLite database and returns a Drizzle ORM instance.
 * @returns {Promise<LibSQLDatabase>} Drizzle ORM instance connected to local database
 * @throws {Error} If local database path cannot be resolved
 */
async function getLocalDatabase(): Promise<
  LibSQLDatabase<Record<string, never>>
> {
  console.log("Using local SQLite database");
  const dbPath = getLocalSQLiteDBPath();

  if (!dbPath) {
    throw new Error("Local DB could not be resolved")
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
async function getProductionDatabase(): Promise<
  SqliteRemoteDatabase<Record<string, never>>
> {
  console.warn("Using production D1 database");
  config({ path: ".prod.vars" });

  const apiToken = process.env.CLOUDFLARE_D1_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_DATABASE_ID;

  if (!apiToken || !accountId || !databaseId) {
    throw new Error(
      "Production environment variables unset. Check your .prod.vars file",
    );
  }

  return createProductionD1Connection(accountId, databaseId, apiToken);
}

/**
 * Creates a connection to a remote Cloudflare D1 database using the sqlite-proxy driver.
 * @param {string} accountId - Cloudflare account ID
 * @param {string} databaseId - D1 database ID
 * @param {string} apiToken - Cloudflare API token with write access to D1
 * @returns {SqliteRemoteDatabase} Drizzle ORM instance connected to remote database
 * @see https://orm.drizzle.team/docs/connect-drizzle-proxy#drizzle-http-proxy
 */
export function createProductionD1Connection(
  accountId: string,
  databaseId: string,
  apiToken: string,
) {

  /**
   * Asynchronously axecutes a single query against the Cloudflare D1 HTTP API.
   * @param {string} sql - The SQL statement to execute
   * @param {unknown[]} params - Parameters for the SQL statement
   * @param {string} method - The method type for the SQL operation
   * @returns {Promise<{ rows: unknown[][] }>} The result rows from the query
   * @throws {Error} If the HTTP request fails or returns an error
   * @see https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/query/
   */
  async function httpQueryD1(
    sql: string,
    params: unknown[],
    method: string,
  ): Promise<{ rows: unknown[][] }> {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params, method }),
    });

    const dbResponse: {
      errors?: { code: number; message: string; }[];
      messages?: { code: number; message: string; }[];
      result?: { results: unknown[]; success: boolean; }[];
      success?: boolean;
    } = await response.json();

    if (response.status !== 200) {
      throw new Error(
        `Query Request Failed: ${response.status} ${response.statusText}`,
        { cause: response },
      );
    }

    if (dbResponse.errors?.length || !dbResponse.success) {
      throw new Error(
        `Query Failed: \n${JSON.stringify(dbResponse)}}`,
        { cause: dbResponse },
      );
    }

    const queryResult = dbResponse?.result?.at(0);
    if (!queryResult || !queryResult.success) {
      throw new Error(
        `Query Failed: \n${JSON.stringify(dbResponse)}`,
        { cause: queryResult },
      );
    }

    const rows = queryResult.results.map((row) => {
      if (row instanceof Object) {
        return Object.values(row);
      }

      throw new TypeError('Unexpected Response: Malformed rows', {
        cause: dbResponse,
      });
    })

    return { rows };
  }

  /**
   * Asynchronously executes a batch of queries.
   */
  const httpBatchQueryD1: AsyncBatchRemoteCallback = async (queries) => {
    const results: { rows: unknown[][] }[] = [];

    for (const query of queries) {
      const { sql, params, method } = query;
      const result = await httpQueryD1(sql, params, method);
      results.push(result);
    }

    return results;
  };

  return drizzleSQLiteProxy(httpQueryD1, httpBatchQueryD1, DB_CONFIG);
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
