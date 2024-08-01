import { HONC_TITLE } from "./const";
import pico from "picocolors";
// import { runPrompts } from "./prompts";
import { getContext } from "./context";
import { path } from "@/actions/path";
import { template } from "@/actions/template";
import { database } from "./actions/database";
import { dependencies } from "./actions/dependencies";
import { git } from "./actions/git";
import { note, outro } from "@clack/prompts";

async function main() {
	console.log("")
	console.log(pico.red(HONC_TITLE));
	console.log("")

	// const { path, template, orm, database, dbProjectName} = await runPrompts();
	
	const context = getContext();

	const actions = [
		path,
		template,
		database,
		dependencies,
		git
	]
	
	for (const action of actions) {
		await action(context)
	}


	note(`
Once you've set up the Neon database, you can generate some migrations, apply them, and seed the database: 

npm run db:generate
npm run db:migrate
npm run db:seed
`)

	outro("🪿 HONC app created successfully!")
	process.exit(0);

}

main().catch((err) => {
	console.error("Unhandled error:", err);
});
