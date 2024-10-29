#!/usr/bin/env node
import { promptPath } from "@/actions/path";
import { actionTemplate, promptTemplate } from "@/actions/template";
import { intro, isCancel, outro } from "@clack/prompts";
import pico from "picocolors";
import { actionCodeGenFinish, actionCodeGenStart } from "./actions/code-gen";
import {
  actionDatabase,
  getDatabasePreamble,
  promptDatabase,
} from "./actions/database";
import { actionDependencies, promptDependencies } from "./actions/dependencies";
import { promptDescription } from "./actions/description";
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

  // If the hatch flag is present, we should use its value
  const shouldHatch = typeof context.hatchValue === "string";
  if (shouldHatch) {
    // TODO - Implement hatching
  }

  // If the hatch flag is present but without a value, we should prompt for a description
  const shouldPromptDescription = context.hatchValue === true;

  const prompts = [
    shouldPromptDescription ? promptDescription : undefined,
    promptPath,
    promptTemplate,
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
    actionCodeGenStart,
    actionDatabase,
    actionDependencies,
    actionGit,
    actionCodeGenFinish,
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

  // Add the default FPX_ENDPOINT environment variable to the .dev.vars file
  touchDevVars(context);

  // Add a reminder of remaining database setup steps, if necessary
  const dbPreamble = getDatabasePreamble(context);

  outro(`🪿 HONC app created successfully in ${context.path}!

${dbPreamble}

# Set up database:
cd ${context.path}
${context.packageManager} run db:setup

# [optional] Use Fiberplane to explore your api:
${context.packageManager} run fiberplane

# Run your api:
${context.packageManager} run dev
`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Unhandled error:", err);
});
