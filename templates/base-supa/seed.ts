
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "./src/db/schema";
import { config } from "dotenv";

config({ path: ".dev.vars" });

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
	await db.insert(users).values([
		{
			name: "Laszlo Cravensworth",
		},
		{
			name: "Nadja Antipaxos",
		},
		{
			name: "Colin Robinson",
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
