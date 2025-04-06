import { config } from "dotenv";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./src/db/schema";
import { execSync } from "child_process";
import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";

config({ path: ".dev.vars" });

// This is a workaround to seed D1 in a local environment
async function seed() {
  // Create a temporary SQL file with the seed data
  // First, clear any existing data to avoid conflicts
  const seedSql = `
    -- Clear existing data
    DELETE FROM reviews;
    DELETE FROM pull_requests;
    
    -- Reset auto-increment counters
    DELETE FROM sqlite_sequence WHERE name IN ('pull_requests', 'reviews');
    
    -- Insert pull requests first
    INSERT INTO pull_requests (title, description, author_id, github_pr_id) VALUES
    ('Add new feature', 'This pull request adds a new feature.', 1, 1),
    ('Fix bug', 'This pull request fixes a bug.', 2, 2);
    
    -- Insert reviews with correct foreign key references
    INSERT INTO reviews (pull_request_id, reviewer_id, comments, status) VALUES
    (1, 3, 'Looks good to me.', 'approved'),
    (2, 1, 'Needs some changes.', 'changes_requested');
  `;

  const tempSqlFile = join(process.cwd(), "temp-seed.sql");
  writeFileSync(tempSqlFile, seedSql);

  try {
    // Execute the SQL file against the D1 database
    execSync(`wrangler d1 execute ghpr-review-bot-db --file=${tempSqlFile}`, {
      stdio: "inherit",
    });
  } finally {
    // Clean up the temporary file
    unlinkSync(tempSqlFile);
  }
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
