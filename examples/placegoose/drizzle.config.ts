import "dotenv/config";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

import { getLocalD1DBPath } from "./src/db/utils";
import { KnownError } from "./src/lib/errors";

type Test = ReturnType<typeof defineConfig>;

let drizzleConfig: Test;

if (process.env.ENVIRONMENT === "production") {
  config({ path: "./.prod.vars" });

  const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
  const CLOUDFLARE_DATABASE_ID = process.env.CLOUDFLARE_DATABASE_ID;
  const CLOUDFLARE_D1_TOKEN = process.env.CLOUDFLARE_D1_TOKEN;

  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_DATABASE_ID || !CLOUDFLARE_D1_TOKEN) {
    throw new KnownError("Configuration Failed: Missing DB Credential(s)");
  }

  drizzleConfig = defineConfig({
    out: './drizzle/migrations',
    schema: './src/db/schema.ts',
    dialect: 'sqlite',
    driver: 'd1-http',
    dbCredentials: {
      accountId: CLOUDFLARE_ACCOUNT_ID,
      databaseId: CLOUDFLARE_DATABASE_ID,
      token: CLOUDFLARE_D1_TOKEN,
    },
  });

} else {
  config({ path: "./.dev.vars" });

  const localDbPath = getLocalD1DBPath();

  if (!localDbPath) {
    console.log("Configuration Failed: Missing Local DB")
    process.exit(1);
  }

  drizzleConfig = defineConfig({
    out: './drizzle/migrations',
    schema: './src/db/schema.ts',
    dialect: 'sqlite',
    dbCredentials: {
      url: localDbPath,
    },
  });

}

export default drizzleConfig;