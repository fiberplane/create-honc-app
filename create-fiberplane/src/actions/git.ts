import { spinner } from "@clack/prompts";
import { execSync } from "node:child_process";
import pico from "picocolors";
import type { Context } from "../context";
import { isInGitRepo } from "../utils";

export async function promptGit(context: Context) {
  // Skip if we're already in a git repo
  if (isInGitRepo()) {
    return;
  }

  // const initGit = await confirm({
  //   message: "Initialize git?",
  //   initialValue: true,
  // });

  // NOTE - Minimize questions, just initialize git
  const initGit = true;

  if (initGit) {
    context.flags.push("initialize-git");
  }

  return initGit;
}

export async function actionGit(context: Context) {
  if (!context.flags.includes("initialize-git") || !context.path) {
    return;
  }

  const s = spinner();
  s.start("Initializing git repository...");

  try {
    execSync("git init", {
      cwd: context.path,
      stdio: "ignore",
    });

    execSync("git add .", {
      cwd: context.path,
      stdio: "ignore",
    });

    execSync('git commit -m "Initial commit: 🤖 create-fiberplane"', {
      cwd: context.path,
      stdio: "ignore",
    });

    s.stop(`${pico.green("✓")} Git repository initialized`);
  } catch (error) {
    s.stop(`${pico.red("✗")} Failed to initialize git repository`);
    throw error;
  }
}
