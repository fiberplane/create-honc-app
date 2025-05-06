import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: "./.dev.vars" });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("Missing Environment Variable: DATABASE_URL");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  casing: "snake_case",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
