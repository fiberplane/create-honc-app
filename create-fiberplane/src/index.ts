#!/usr/bin/env node
import { intro, isCancel, outro } from "@clack/prompts";
import pico from "picocolors";
import { actionAIAssistant, promptAIAssistant } from "./actions/ai-assistant";
import { actionDependencies, promptDependencies } from "./actions/dependencies";
import { actionDeploy, promptDeploy } from "./actions/deploy";
import { actionGit, promptGit } from "./actions/git";
import { promptPath } from "./actions/path";
import { actionTemplate } from "./actions/template";
import { FIBERPLANE_TITLE } from "./const";
import { initContext } from "./context";
import { isError } from "./types";
import { handleCancel, handleError } from "./utils";

async function main() {
  console.log("");
  console.log(pico.cyan(FIBERPLANE_TITLE));
  console.log("");

  intro("🚀 create-fiberplane");

  const context = initContext();

  const prompts = [
    promptPath,
    promptAIAssistant,
    promptDependencies,
    promptGit,
    promptDeploy,
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
    actionAIAssistant,
    actionDependencies,
    actionGit,
    actionDeploy,
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

  outro(`🚀 MCP project created successfully in ${context.path}!

${pico.cyan("Next steps:")}

# Navigate to your project:
cd ${context.name}

# Start developing:
${context.packageManager} run dev

# Learn more about MCP:
open https://modelcontextprotocol.io

${
  context.flags.includes("deploy-fiberplane")
    ? `\n${pico.green("✓")} Fiberplane deployment is configured and ready!`
    : ""
}
`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
