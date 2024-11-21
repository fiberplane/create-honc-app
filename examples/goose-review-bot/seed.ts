import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./src/db/schema";

config({ path: ".dev.vars" });

// biome-ignore lint/style/noNonNullAssertion: error from neon client is helpful enough to fix
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const seedPullRequests = [
  {
    title: "Add new feature",
    description: "This pull request adds a new feature.",
    authorId: 1,
  },
  {
    title: "Fix bug",
    description: "This pull request fixes a bug.",
    authorId: 2,
  },
];

const seedReviews = [
  {
    pullRequestId: 1,
    reviewerId: 3,
    comments: "Looks good to me.",
    status: "approved",
  },
  {
    pullRequestId: 2,
    reviewerId: 1,
    comments: "Needs some changes.",
    status: "changes_requested",
  },
];

async function seed() {
  await db.insert(schema.pullRequests).values(seedPullRequests);
  await db.insert(schema.reviews).values(seedReviews);
}

async function main() {
  try {
    await seed();
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
