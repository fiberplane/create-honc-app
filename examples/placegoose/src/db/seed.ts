import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import * as seedData from "./seedData"
import { getLocalD1DBPath } from "./utils";

async function seedLocalDatabase() {
    const dbPath = getLocalD1DBPath();

    if (!dbPath) {
        throw new Error("Database seed failed: local DB could not be resolved");
    }

    const client = createClient({
        url: `file:${dbPath}`
    });

    const db = drizzle(client);

    try {
        console.log("Seeding database...");

        await db.batch([
            db.insert(schema.gaggles).values(seedData.gaggles),
            db.insert(schema.geese).values(seedData.geese),
            db.insert(schema.honks).values(seedData.honks)
        ]);

        console.log("Database seeded successfully!");
    } catch (error) {
        console.error(error)
    }
}

seedLocalDatabase();
