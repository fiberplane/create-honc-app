import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./src/db/schema";
import type { NewWebsite } from "./src/db/schema";

const seedWebsites: NewWebsite[] = [
  {
    url: "https://cloudflare.com",
    name: "Cloudflare Website",
    checkInterval: 60, // Check every 60 seconds
    createdAt: new Date().toISOString()
  },
  {
    url: "https://workers.cloudflare.com",
    name: "Cloudflare Workers",
    checkInterval: 300, // Check every 5 minutes
    createdAt: new Date().toISOString()
  },
  {
    url: "https://developers.cloudflare.com",
    name: "Cloudflare Developers",
    checkInterval: 120, // Check every 2 minutes
    createdAt: new Date().toISOString()
  }
];

const seedDatabase = async () => {
  const pathToDb = getLocalD1DB();
  if (!pathToDb) {
    console.error("❌ Could not find local D1 database");
    process.exit(1);
  }
  
  const client = createClient({
    url: `file:${pathToDb}`,
  });
  const db = drizzle(client);
  console.log("Seeding database...");
  try {
    await db.insert(schema.websites).values(seedWebsites);
    console.log("✅ Database seeded successfully!");
    console.log("🪿 Run `npm run fiberplane` to explore data with your api.");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    client.close();
  }
};

seedDatabase();

function getLocalD1DB() {
  try {
    const basePath = path.resolve(".wrangler");
    const files = fs
      .readdirSync(basePath, { encoding: "utf-8", recursive: true })
      .filter((f) => f.endsWith(".sqlite"));

    files.sort((a, b) => {
      const statA = fs.statSync(path.join(basePath, a));
      const statB = fs.statSync(path.join(basePath, b));
      return statB.mtime.getTime() - statA.mtime.getTime();
    });
    const dbFile = files[0];

    if (!dbFile) {
      throw new Error(`.sqlite file not found in ${basePath}`);
    }

    return path.resolve(basePath, dbFile);
  } catch (err) {
    if (err instanceof Error) {
      console.log(`Error resolving local D1 DB: ${err.message}`);
    } else {
      console.log(`Error resolving local D1 DB: ${err}`);
    }
    return null;
  }
}
