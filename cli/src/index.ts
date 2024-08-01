#!/usr/bin/env node
import { getContext } from "./context";
import { path } from "@/actions/path";
import { template } from "@/actions/template";
import { database } from "./actions/database";
import { dependencies } from "./actions/dependencies";
import { git } from "./actions/git";
import { intro, note, outro } from "@clack/prompts";

async function main() {
  // NOTE: ASCII art is breaking installs so uhhhh
  // console.log("");
  // console.log(pico.red(HONC_TITLE));
  // console.log("");

  // const { path, template, orm, database, dbProjectName} = await runPrompts();
  //
  intro("🪿 create-honc-app");

  const context = getContext();

  const actions = [path, template, database, dependencies, git];

  for (const action of actions) {
    await action(context);
  }

  outro(`🪿 HONC app created successfully in ${context.path}!`);
  note(`
Once you've set up the Neon database, you can generate the migrations, 
apply them, and seed the database using the following commands: 

npm run db:generate
npm run db:migrate
npm run db:seed
`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Unhandled error:", err);
});
