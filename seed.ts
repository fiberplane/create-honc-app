import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { users } from "./src/db/schema";
import { config } from "dotenv";

config({ path: '.dev.vars' });

// biome-ignore lint/style/noNonNullAssertion: error from neon client is helpful enough to fix
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
  await db.insert(users).values([
    {
      name: "Laszlo Cravensworth",
    },
    {
      name: "Nadja Antipaxos",
    },
    {
      name: "Colin Robinson",
    },
  ]);
}

async function main() {
  try {
    await seed();
    console.log("Seeding completed");
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
}
main();