import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { users, type NewUser } from "./src/db/schema";

config({ path: ".dev.vars" });

// biome-ignore lint/style/noNonNullAssertion: error from neon client is helpful enough to fix
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const seedData: NewUser[] = [
  { name: "Nikita Shamgunov", email: "nikita.shamgunov@example.com" },
  { name: "Heikki Linnakangas", email: "heikki.linnakangas@example.com" },
  { name: "Stas Kelvich", email: "stas.kelvich@example.com" },
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
