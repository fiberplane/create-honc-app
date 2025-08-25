import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { seed } from "drizzle-seed";
import * as schema from "./src/db/schema";

seedDatabase();

async function seedDatabase() {
  try {
    if (process.env.ENVIRONMENT === "production") {
      config({ path: "./.prod.vars" });
    } else {
      config({ path: "./.dev.vars" });
    }

    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      throw new Error("Missing Environment Variable: DATABASE_URL");
    }

    const client = neon(DATABASE_URL);
    const db = drizzle(client, {
      casing: "snake_case",
    });

    // Read more about seeding here: https://orm.drizzle.team/docs/seed-overview#drizzle-seed
    await seed(db, schema);
    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}
