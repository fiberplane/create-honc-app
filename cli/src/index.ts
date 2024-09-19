#!/usr/bin/env node
import { getContext } from "./context";
import { promptPath } from "@/actions/path";
import { promptTemplate, actionTemplate } from "@/actions/template";
import { promptDatabase, actionDatabase } from "./actions/database";
import { promptDependencies, actionDependencies } from "./actions/dependencies";
import { promptGit, actionGit } from "./actions/git";
import pico from "picocolors";
import { intro, outro, isCancel } from "@clack/prompts";
import { HONC_TITLE } from "./const";
import { handleCancel, handleError } from "./utils";

async function main() {
  console.log("");
  console.log(pico.red(HONC_TITLE));
  console.log("");

  intro("🪿 create-honc-app");

  const context = getContext();

  const prompts = [
    promptPath,
    promptTemplate,
    promptDependencies,
    promptGit,
    promptDatabase,
  ];

  for (const prompt of prompts) {
    const result = await prompt(context);
    if (isCancel(result)) {
      handleCancel();
    }

    if (result instanceof Error) {
      handleError(result);
    }
  }

  const actions = [
    actionTemplate,
    actionDependencies,
    actionGit,
    actionDatabase,
  ];

  for (const action of actions) {
    const result = await action(context);

    if (isCancel(result)) {
      handleCancel();
    }

    if (result instanceof Error) {
      handleError(result);
    }
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
