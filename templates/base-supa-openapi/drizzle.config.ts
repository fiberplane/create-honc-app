import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: "./.dev.vars" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
