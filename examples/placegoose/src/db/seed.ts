import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./schema";
import * as seedData from "./seedData";
import { getLocalD1DBPath } from "./utils";

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

    const db = drizzle(client);
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
