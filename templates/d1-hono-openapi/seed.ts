import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import {
  type AsyncBatchRemoteCallback,
  type AsyncRemoteCallback,
  drizzle as drizzleSQLiteProxy,
  type SqliteRemoteDatabase,
} from "drizzle-orm/sqlite-proxy";
import { seed } from "drizzle-seed";

import * as schema from "./src/db/schema";
import path from "node:path";
import fs from "node:fs";
import { config } from "dotenv";

// biome-ignore lint/suspicious/noExplicitAny: Centralize usage of `any` type, since we use it in db results that are not worth the pain of typing
type Any = any;

seedDatabase();

async function seedDatabase() {
  const isProd = process.env.ENVIRONMENT === "production";
  const db = isProd ? await getProductionDatabase() : getLocalD1Db();

  if (isProd) {
    console.warn("🚨 Seeding production database");
  }

  try {
    // Read more about seeding here: https://orm.drizzle.team/docs/seed-overview#drizzle-seed
    await seed(db, schema);
    console.log("✅ Database seeded successfully!");
    if (!isProd) {
      }
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

/**
 * Creates a connection to the local D1 database and returns a Drizzle ORM instance.
 *
 * Relies on `getLocalD1DBPath` to find the path to the local D1 database inside the `.wrangler` directory.
 */
function getLocalD1Db() {
  const pathToDb = getLocalD1DBPath();
  if (!pathToDb) {
    console.error(
      "⚠️ Local D1 database not found. Try running `npm run db:touch` to create one.",
    );
    process.exit(1);
  }

  const client = createClient({
    url: `file:${pathToDb}`,
  });
  const db = drizzle(client);
  return db;
}

/**
 * Finds the path to the local D1 database inside the `.wrangler` directory.
 */
function getLocalD1DBPath() {
  try {
    const basePath = path.resolve(".wrangler");
    const files = fs
      .readdirSync(basePath, { encoding: "utf-8", recursive: true })
      .filter((f) => f.endsWith(".sqlite"));

    // In case there are multiple .sqlite files, we want the most recent one.
    files.sort((a, b) => {
      const statA = fs.statSync(path.join(basePath, a));
      const statB = fs.statSync(path.join(basePath, b));
      return statB.mtime.getTime() - statA.mtime.getTime();
    });
    const dbFile = files[0];

    if (!dbFile) {
      throw new Error(`.sqlite file not found in ${basePath}`);
    }

    const url = path.resolve(basePath, dbFile);

    return url;
  } catch (err) {
    if (err instanceof Error) {
      console.log(`Error resolving local D1 DB: ${err.message}`);
    } else {
      console.log(`Error resolving local D1 DB: ${err}`);
    }
  }
}

/**
 * Creates a connection to the production Cloudflare D1 database and returns a Drizzle ORM instance.
 * Loads production environment variables from .prod.vars file.
 *
 * @returns {Promise<SqliteRemoteDatabase>} Drizzle ORM instance connected to production database
 * @throws {Error} If required environment variables are not set
 */
async function getProductionDatabase(): Promise<
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
 * @param accountId - Cloudflare account ID
 * @param databaseId - D1 database ID
 * @param apiToken - Cloudflare API token with write access to D1
 * @returns Drizzle ORM instance connected to remote database
 */
export function createProductionD1Connection(
  accountId: string,
  databaseId: string,
  apiToken: string,
) {
  /**
   * Executes a single query against the Cloudflare D1 HTTP API.
   *
   * @param accountId - Cloudflare account ID
   * @param databaseId - D1 database ID
   * @param apiToken - Cloudflare API token with write access to D1
   * @param sql - The SQL statement to execute
   * @param params - Parameters for the SQL statement
   * @param method - The method type for the SQL operation
   * @returns The result rows from the query
   * @throws If the HTTP request fails or returns an error
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

  return drizzleSQLiteProxy(queryClient, batchQueryClient);
}
