import fs from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import { createClient } from "@libsql/client";
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
import * as schema from "./src/db/schema";
import type { NewWebsite } from "./src/db/schema";

// Sample seed data for websites
const seedWebsites: NewWebsite[] = [
  {
    url: "https://cloudflare.com",
    name: "Cloudflare Website",
    checkInterval: 60, // Check every 60 seconds
    createdAt: new Date().toISOString(),
  },
  {
    url: "https://workers.cloudflare.com",
    name: "Cloudflare Workers",
    checkInterval: 300, // Check every 5 minutes
    createdAt: new Date().toISOString(),
  },
  {
    url: "https://developers.cloudflare.com",
    name: "Cloudflare Developers",
    checkInterval: 120, // Check every 2 minutes
    createdAt: new Date().toISOString(),
  },
];

// Ensure database clients expect snake_case column names
const DB_CONFIG = {
  casing: "snake_case",
} as const;

seedDatabase();

/**
 * Main function to seed the database with initial data.
 * Determines whether to seed local or production database based on environment.
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
     */
    const chunkInserts = <T extends SQLiteTable>(table: T, data: T["$inferInsert"][], batchSize: number) => {
      const dataChunks = chunkArray(data, batchSize);

      // Initialize the array with the first insert
      const chunkedInserts: [BatchItem<"sqlite">, ...BatchItem<"sqlite">[]] = [
        db.insert(table).values(dataChunks[0]),
      ];

      // Loop starts at 1 as we've already added 0
      for (let i = 1; i < dataChunks.length; i++) {
        const batchItem = db.insert(table).values(dataChunks[i]);
        chunkedInserts.push(batchItem);
      }

      return chunkedInserts;
    }

    // Calculate batch size based on number of columns (100 bound vars / 5 columns)
    const websiteBatchSize = Math.floor(100 / Object.keys(schema.websites).length);

    // Batch writes to insert in transaction
    await db.batch([
      ...chunkInserts(schema.websites, seedWebsites, websiteBatchSize),
    ]);

    console.log("✅ Database seeded successfully!");
    console.log("🪿 Run `npm run fiberplane` to explore data with your api.");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

/**
 * Creates a connection to the local D1 SQLite database and returns a Drizzle ORM instance.
 */
async function getLocalDatabase(): Promise<LibSQLDatabase<Record<string, never>>> {
  console.log("Using local SQLite database");
  const dbPath = getLocalD1DB();

  if (!dbPath) {
    throw new Error("Local DB could not be resolved");
  }

  const client = createClient({
    url: `file:${dbPath}`,
  });

  return drizzleLibsql(client, DB_CONFIG);
}

/**
 * Creates a connection to the production Cloudflare D1 database.
 */
async function getProductionDatabase(): Promise<SqliteRemoteDatabase<Record<string, never>>> {
  console.warn("Using production D1 database");
  console.log(process.env);
  console.log(process.env.CLOUDFLARE_API_TOKEN);
  console.log(process.env.CLOUDFLARE_ACCOUNT_ID); // correct
  console.log(process.env.DATABASE_ID);
  console.log(process.env.DB);
  config({ path: ".prod.vars" });

  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_DATABASE_ID;

  if (!apiToken || !accountId || !databaseId) {
    throw new Error(
      "Production environment variables unset. Make sure CLOUDFLARE_D1_TOKEN, CLOUDFLARE_ACCOUNT_ID, and CLOUDFLARE_DATABASE_ID are set in your environment.",
    );
  }

  return createProductionD1Connection(accountId, databaseId, apiToken);
}

/**
 * Creates a connection to a remote Cloudflare D1 database using the sqlite-proxy driver.
 */
function createProductionD1Connection(
  accountId: string,
  databaseId: string,
  apiToken: string,
) {
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
    if (!queryResult?.success) {
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
    });

    return { rows };
  }

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
 * Helper function to get the path to the local D1 database.
 */
function getLocalD1DB() {
  try {
    const basePath = path.resolve(".wrangler");
    const files = fs
      .readdirSync(basePath, { encoding: "utf-8", recursive: true })
      .filter((f) => f.endsWith(".sqlite"));

    files.sort((a, b) => {
      const statA = fs.statSync(path.join(basePath, a));
      const statB = fs.statSync(path.join(basePath, b));
      return statB.mtime.getTime() - statA.mtime.getTime();
    });
    const dbFile = files[0];

    if (!dbFile) {
      throw new Error(`.sqlite file not found in ${basePath}`);
    }

    return path.resolve(basePath, dbFile);
  } catch (err) {
    if (err instanceof Error) {
      console.log(`Error resolving local D1 DB: ${err.message}`);
    } else {
      console.log(`Error resolving local D1 DB: ${err}`);
    }
    return null;
  }
}

/**
 * Splits an array into smaller chunks.
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}
