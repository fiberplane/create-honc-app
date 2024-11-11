import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { jokes } from "./src/db/schema";

config({ path: ".dev.vars" });

// biome-ignore lint/style/noNonNullAssertion: error from neon client is helpful enough to fix
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
  await db.insert(jokes).values([
    {
      content:
        "Why don't geese like people? They're always giving them the cold shoulder!",
    },
    {
      content:
        "What do you call a goose that's always complaining? A grumpy gander!",
    },
    {
      content: "How do geese like their eggs? Goose-side up!",
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
  } finally {
    process.exit(0);
  }
}
main();
