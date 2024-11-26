import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "../../src/db/schema";
import { getLocalD1DBPath } from "../../src/db/utils";
import * as seedData from "./data";

async function seedLocalDatabase() {
  try {
    const dbPath = getLocalD1DBPath();

    if (!dbPath) {
      console.error("Database seed failed: local DB could not be resolved");
      process.exit(1);
    }

    const client = createClient({
      url: `file:${dbPath}`,
    });

    // Ensure client expects snake_case column names
    const db = drizzle(client, { casing: "snake_case" });
    console.log("Seeding database...");

    await db.batch([
      db.insert(schema.gaggles).values(seedData.gaggles),
      db.insert(schema.geese).values(seedData.geese),
      db.insert(schema.honks).values(seedData.honks),
    ]);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seedLocalDatabase();
