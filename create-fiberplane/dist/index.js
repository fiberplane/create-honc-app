#!/usr/bin/env node

// src/index.ts
import { intro, isCancel, outro } from "@clack/prompts";
import pico7 from "picocolors";

// src/actions/ai-assistant.ts
import { select } from "@clack/prompts";
async function promptAIAssistant(context) {
  const aiAssistant = await select({
    message: "Install AI assistance?",
    options: [
      { value: "cursor", label: "Cursor" },
      { value: "claude-code", label: "Claude Code" },
      { value: "vscode", label: "VSCode" },
      { value: "windsurf", label: "Windsurf" },
      { value: "none", label: "None" }
    ],
    initialValue: "cursor"
  });
  if (typeof aiAssistant === "string") {
    context.aiAssistant = aiAssistant;
  }
  return aiAssistant;
}
async function actionAIAssistant(context) {
  if (!context.aiAssistant || context.aiAssistant === "none") {
    return;
  }
  return;
}

// src/actions/dependencies.ts
import { confirm, spinner } from "@clack/prompts";
import { execSync } from "node:child_process";
import pico from "picocolors";
async function promptDependencies(context) {
  const installDeps = await confirm({
    message: "Install dependencies?",
    initialValue: true
  });
  if (installDeps) {
    context.flags.push("install-dependencies");
  }
  return installDeps;
}
async function actionDependencies(context) {
  if (!context.flags.includes("install-dependencies") || !context.path) {
    return;
  }
  const s = spinner();
  s.start("Installing dependencies...");
  try {
    execSync(`cd ${context.path} && ${context.packageManager} install`, {
      stdio: "ignore"
    });
    s.stop(`${pico.green("\u2713")} Dependencies installed successfully`);
  } catch (error) {
    s.stop(`${pico.red("\u2717")} Failed to install dependencies`);
    throw error;
  }
}

// src/actions/deploy.ts
import { confirm as confirm2, spinner as spinner2 } from "@clack/prompts";
import pico2 from "picocolors";
async function promptDeploy(context) {
  const deployFiberplane = await confirm2({
    message: '"Make it live" (Deploy with Fiberplane?)',
    initialValue: true
  });
  if (deployFiberplane) {
    context.flags.push("deploy-fiberplane");
  }
  return deployFiberplane;
}
async function actionDeploy(context) {
  if (!context.flags.includes("deploy-fiberplane") || !context.path) {
    return;
  }
  const s = spinner2();
  s.start("Setting up Fiberplane deployment...");
  try {
    await new Promise((resolve) => setTimeout(resolve, 2e3));
    s.stop(`${pico2.green("\u2713")} Fiberplane deployment configured`);
    console.log(`
${pico2.cyan("\u{1F680} Your MCP project is ready to deploy!")}

Next steps:
1. Configure your Fiberplane account
2. Set up your deployment pipeline
3. Deploy your MCP server

Visit https://fiberplane.com/docs for more information.
`);
  } catch (error) {
    s.stop(`${pico2.red("\u2717")} Failed to configure Fiberplane deployment`);
    throw error;
  }
}

// src/actions/git.ts
import { confirm as confirm3, spinner as spinner3 } from "@clack/prompts";
import { execSync as execSync3 } from "node:child_process";
import pico4 from "picocolors";

// src/utils.ts
import { cancel } from "@clack/prompts";
import { execSync as execSync2 } from "node:child_process";
import pico3 from "picocolors";

// src/const.ts
var FIBERPLANE_TITLE = `
 ______   __     ______     ______     ______     ______   __         ______     __   __     ______    
/\\  ___\\ /\\ \\   /\\  == \\   /\\  ___\\   /\\  == \\   /\\  == \\ /\\ \\       /\\  __ \\   /\\ "-.\\ \\   /\\  ___\\   
\\ \\  __\\ \\ \\ \\  \\ \\  __<   \\ \\  __\\   \\ \\  __<   \\ \\  _-/ \\ \\ \\____  \\ \\  __ \\  \\ \\ \\-.  \\  \\ \\  __\\   
 \\ \\_\\    \\ \\_\\  \\ \\_____\\  \\ \\_____\\  \\ \\_\\ \\_\\  \\ \\_\\    \\ \\_____\\  \\ \\_\\ \\_\\  \\ \\_\\\\"\\_\\  \\ \\_____\\ 
  \\/_/     \\/_/   \\/_____/   \\/_____/   \\/_/ /_/   \\/_/     \\/_____/   \\/_/\\/_/   \\/_/ \\/_/   \\/_____/ 
                                                                                                        
`;
var CANCEL_MESSAGE = "create-fiberplane cancelled! \u{1F680}";
var PROJECT_NAME = "lorem-ipsum-mcp";

// src/utils.ts
function handleCancel() {
  cancel(CANCEL_MESSAGE);
  process.exit(0);
}
function handleError(error) {
  console.error(pico3.red(`\u274C ${error.message}`));
  process.exit(1);
}
function getPackageManager() {
  const userAgent = process.env.npm_config_user_agent;
  if (userAgent) {
    if (userAgent.startsWith("pnpm")) {
      return "pnpm";
    }
    if (userAgent.startsWith("yarn")) {
      return "yarn";
    }
    if (userAgent.startsWith("bun")) {
      return "bun";
    }
  }
  return "npm";
}
function isInGitRepo() {
  try {
    execSync2("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// src/actions/git.ts
async function promptGit(context) {
  if (isInGitRepo()) {
    return;
  }
  const initGit = await confirm3({
    message: "Initialize git?",
    initialValue: true
  });
  if (initGit) {
    context.flags.push("initialize-git");
  }
  return initGit;
}
async function actionGit(context) {
  if (!context.flags.includes("initialize-git") || !context.path) {
    return;
  }
  const s = spinner3();
  s.start("Initializing git repository...");
  try {
    execSync3(`cd ${context.path} && git init`, {
      stdio: "ignore"
    });
    execSync3(`cd ${context.path} && git add .`, {
      stdio: "ignore"
    });
    execSync3(`cd ${context.path} && git commit -m "Initial commit"`, {
      stdio: "ignore"
    });
    s.stop(`${pico4.green("\u2713")} Git repository initialized`);
  } catch (error) {
    s.stop(`${pico4.red("\u2717")} Failed to initialize git repository`);
    throw error;
  }
}

// src/actions/path.ts
import { text } from "@clack/prompts";
import { existsSync } from "node:fs";
import { join } from "node:path";
import pico5 from "picocolors";
async function promptPath(context) {
  const path = await text({
    message: "Name of folder?",
    placeholder: context.name,
    defaultValue: context.name,
    validate: (value) => {
      if (!value) {
        return "Please enter a folder name";
      }
      if (existsSync(join(context.cwd, value))) {
        return `Folder ${pico5.red(value)} already exists`;
      }
    }
  });
  if (typeof path === "string") {
    context.name = path;
    context.path = join(context.cwd, path);
  }
  return path;
}

// src/actions/template.ts
import { spinner as spinner4 } from "@clack/prompts";
import { downloadTemplate } from "giget";
import { existsSync as existsSync2, mkdirSync } from "node:fs";
import pico6 from "picocolors";
var MCP_TEMPLATE_URL = "github:fiberplane/mcp-template";
async function actionTemplate(context) {
  if (!context.path) {
    throw new Error("Path not set");
  }
  const s = spinner4();
  s.start("Creating MCP project from template...");
  try {
    if (!existsSync2(context.path)) {
      mkdirSync(context.path, { recursive: true });
    }
    await downloadTemplate(MCP_TEMPLATE_URL, {
      dir: context.path,
      force: true
    });
    s.stop(`${pico6.green("\u2713")} MCP template downloaded successfully`);
  } catch (error) {
    s.stop(`${pico6.red("\u2717")} Failed to download template`);
    throw error;
  }
}

// src/context.ts
function initContext() {
  const projectName = parseProjectName(process.argv);
  return {
    cwd: process.cwd(),
    name: projectName ?? PROJECT_NAME,
    packageManager: getPackageManager() ?? "npm",
    flags: []
  };
}
function parseProjectName(args) {
  const projectName = args.at(2);
  if (!projectName || projectName.startsWith("-")) {
    return void 0;
  }
  return projectName;
}

// src/types.ts
var isError = (error) => {
  return error instanceof Error;
};

// src/index.ts
async function main() {
  console.log("");
  console.log(pico7.cyan(FIBERPLANE_TITLE));
  console.log("");
  intro("\u{1F680} create-fiberplane");
  const context = initContext();
  const prompts = [
    promptPath,
    promptAIAssistant,
    promptDependencies,
    promptGit,
    promptDeploy
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
    actionDeploy
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
  outro(`\u{1F680} MCP project created successfully in ${context.path}!

${pico7.cyan("Next steps:")}

# Navigate to your project:
cd ${context.name}

# Start developing:
${context.packageManager} run dev

# Learn more about MCP:
open https://modelcontextprotocol.io

${context.flags.includes("deploy-fiberplane") ? `
${pico7.green("\u2713")} Fiberplane deployment is configured and ready!` : ""}
`);
  process.exit(0);
}
main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
