import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { users, type NewUser } from "./src/db/schema";
import { seed } from "drizzle-seed";

config({ path: ".dev.vars" });

// biome-ignore lint/style/noNonNullAssertion: error from neon client is helpful enough to fix
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seedDatabase() {
  await seed(db, { users }).refine((f) => ({
    users: {
      count: 10,
      columns: {
        name: f.fullName(),
        email: f.email(),
      },
    },
  }));
}

async function main() {
  try {
    await seedDatabase();
    console.log("✅ Database seeded successfully!");
    console.log("🪿 Run `npm run fiberplane` to explore data with your api.");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}
main();
