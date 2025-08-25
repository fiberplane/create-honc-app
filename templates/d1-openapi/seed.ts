import { createClient } from "@libsql/client";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/libsql";
import { type SqliteRemoteDatabase, drizzle as drizzleSQLiteProxy } from "drizzle-orm/sqlite-proxy";
import { seed } from "drizzle-seed";
import { getLocalD1DbPath } from "./drizzle/local";
import { createProxyCallbacks } from "./drizzle/remote";
import * as schema from "./src/db/schema";

seedDatabase();

async function seedDatabase() {
  try {
    const isProd = process.env.ENVIRONMENT === "production";
    const db = isProd ? await getProductionDatabase() : getLocalD1Db();

    if (isProd) {
      console.warn("🚨 Seeding production database");
    }
    
    // Read more about seeding here: https://orm.drizzle.team/docs/seed-overview#drizzle-seed
    await seed(db, schema).refine((funcs) => ({
      users: {
        columns: {
          id: funcs.uuid(),
          createdAt: funcs.timestamp(),
          updatedAt: funcs.timestamp(),
        },
      },
    }));

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

/**
 * Creates a connection to the local D1 database and returns a Drizzle ORM instance.
 *
 * Relies on `getLocalD1DBPath` to find the path to the local D1 database inside the `.wrangler` directory.
 */
function getLocalD1Db() {
  const localDbPath = getLocalD1DbPath();

  const client = createClient({
    url: `file:${localDbPath}`,
  });

  const db = drizzle(client, {
    casing: "snake_case",
  });

  return db;
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

  const { httpQueryD1, httpBatchQueryD1 } = createProxyCallbacks({
    accountId,
    databaseId,
    apiToken,
  });

  return drizzleSQLiteProxy(httpQueryD1, httpBatchQueryD1, {
    casing: "snake_case",
  });
}
