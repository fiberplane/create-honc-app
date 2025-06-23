import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { seed } from "drizzle-seed";
import postgres from "postgres";
import * as schema from "./src/db/schema";

config({ path: ".dev.vars" });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("Missing Environment Variable: DATABASE_URL");
}

const sql = postgres(DATABASE_URL);
const db = drizzle(sql, {
  casing: "snake_case",
});

async function seedDatabase() {
  // Read more about seeding here: https://orm.drizzle.team/docs/seed-overview#drizzle-seed
  await seed(db, schema);
}

async function main() {
  try {
    await seedDatabase();
    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
