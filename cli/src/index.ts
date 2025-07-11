#!/usr/bin/env node
import { promptPath } from "@/actions/path";
import {
  actionTemplate,
  promptOpenAPI,
  promptTemplate,
} from "@/actions/template";
import { intro, isCancel, outro } from "@clack/prompts";
import pico from "picocolors";
import {
  actionDatabase,
  getDatabasePreamble,
  promptDatabase,
} from "./actions/database";
import { actionDependencies, promptDependencies } from "./actions/dependencies";
import { actionGit, promptGit } from "./actions/git";
import { HONC_TITLE } from "./const";
import { initContext } from "./context";
import { updateProjectName } from "./project-name";
import { touchDevVars } from "./touch-dev-vars";
import { isError } from "./types";
import { handleCancel, handleError } from "./utils";

async function main() {
  console.log("");
  console.log(pico.red(HONC_TITLE));
  console.log("");

  intro("🪿 create-honc-app");

  const context = initContext();

  const prompts = [
    promptPath,
    promptTemplate,
    promptOpenAPI,
    promptDatabase,
    promptDependencies,
    promptGit,
  ];

  for (const prompt of prompts) {
    if (!prompt) {
      continue;
    }

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
    actionDatabase,
    actionDependencies,
    actionGit,
  ];

  for (const action of actions) {
    const result = await action(context);

    if (isCancel(result)) {
      handleCancel();
    }

    if (isError(result)) {
      handleError(result);
    }
  }

  // Update the project name in the package.json file and wrangler.toml file
  updateProjectName(context);

  // Add a (gitignored) .dev.vars file
  touchDevVars(context);

  // Add a reminder of remaining database setup steps, if necessary
  const dbPreamble = getDatabasePreamble(context);

  outro(`🪿 HONC app created successfully in ${context.path}!

${dbPreamble}

# Set up database:
cd ${context.path}
${context.packageManager} run db:setup

# Run your api:
${context.packageManager} run dev

# [optional] Use Fiberplane to explore your api
open http://localhost:8787/fp
`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Unhandled error:", err);
});
