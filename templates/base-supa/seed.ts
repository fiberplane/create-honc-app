import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { type NewUser, users } from "./src/db/schema";

config({ path: ".dev.vars" });

const sql = postgres(process.env.DATABASE_URL ?? "");
const db = drizzle(sql);

const seedData: NewUser[] = [
  { name: "Paul Copplestone", email: "paul@supabase.com" },
  { name: "Ant Wilson", email: "ant@supabase.com" },
  { name: "Michael Stonebraker", email: "databasesarecool@berkeley.edu" },
];

async function seed() {
  await db.insert(users).values(seedData);
}

async function main() {
  try {
    await seed();
    console.log("Seeding completed");
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}
main();
