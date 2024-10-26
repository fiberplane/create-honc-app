import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./src/db/schema";

interface User {
  name: string;
  email: string;
}

const seedData: User[] = [
  { name: "Laszlo Cravensworth", email: "laszlo.cravensworth@example.com" },
  { name: "Nadja Antipaxos", email: "nadja.antipaxos@example.com" },
  { name: "Colin Robinson", email: "colin.robinson@example.com" },
];

const seedDatabase = async () => {
  const pathToDb = getLocalD1DB();
  const client = createClient({
    url: `file:${pathToDb}`,
  });
  const db = drizzle(client);
  console.log("Seeding database...");
  try {
    await db.insert(schema.users).values(seedData);
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

seedDatabase();

function getLocalD1DB() {
  try {
    const basePath = path.resolve(".wrangler");
    const files = fs
      .readdirSync(basePath, { encoding: "utf-8", recursive: true })
      .filter((f) => f.endsWith(".sqlite"));

    // In case there are multiple .sqlite files, we want the most recent one.
    files.sort((a, b) => {
      const statA = fs.statSync(path.join(basePath, a));
      const statB = fs.statSync(path.join(basePath, b));
      return statB.mtime.getTime() - statA.mtime.getTime();
    });
    const dbFile = files[0];

    if (!dbFile) {
      throw new Error(`.sqlite file not found in ${basePath}`);
    }

    const url = path.resolve(basePath, dbFile);

    return url;
  } catch (err) {
    if (err instanceof Error) {
      console.log(`Error resolving local D1 DB: ${err.message}`);
    } else {
      console.log(`Error resolving local D1 DB: ${err}`);
    }
  }
}
