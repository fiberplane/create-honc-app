import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { getLocalD1DbPath } from "./drizzle/local";

let dbConfig: ReturnType<typeof defineConfig>;

if (process.env.ENVIRONMENT === "production") {
  config({ path: "./.prod.vars" });

  const apiToken = process.env.CLOUDFLARE_D1_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_DATABASE_ID;

  if (!apiToken || !accountId || !databaseId) {
    throw new Error(
      "Database seed failed: production environment variables not set (make sure you have a .prod.vars file)",
    );
  }

  dbConfig = defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle/migrations",
    dialect: "sqlite",
    driver: "d1-http",
    casing: "snake_case",
    dbCredentials: {
      accountId,
      databaseId,
      token: apiToken,
    },
  });
} else {
  config({ path: "./.dev.vars" });

  const localDbPath = getLocalD1DbPath();

  dbConfig = defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle/migrations",
    dialect: "sqlite",
    casing: "snake_case",
    dbCredentials: {
      url: localDbPath,
    },
  });
}

export default dbConfig;
