#!/usr/bin/env node
import { getContext } from "./context";
import { path } from "@/actions/path";
import { template } from "@/actions/template";
import { database } from "./actions/database";
import { dependencies } from "./actions/dependencies";
import { git } from "./actions/git";
import pico from "picocolors";
import { intro, outro } from "@clack/prompts";
import { HONC_TITLE } from "./const";

async function main() {
  console.log("");
  console.log(pico.red(HONC_TITLE));
  console.log("");

  intro("🪿 create-honc-app");

  const context = getContext();

  const actions = [path, template, database, dependencies, git];

  for (const action of actions) {
    await action(context);
  }

  outro(`🪿 HONC app created successfully in ${context.path}!

Once you've set up the database, you can generate the migrations,
apply them, and seed the database using the following commands:

${context.packageManager} run db:generate
${context.packageManager} run db:migrate
${context.packageManager} run db:seed
	`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Unhandled error:", err);
});
