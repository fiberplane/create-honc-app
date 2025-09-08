import { spinner } from "@clack/prompts";
import { execSync } from "node:child_process";
import pico from "picocolors";
import type { Context } from "../context";
import { debugGit } from "../logger";
import { isInGitRepo } from "../utils";

export async function promptGit(context: Context) {
  // Skip if we're already in a git repo
  if (isInGitRepo(context.path)) {
    debugGit.info(
      { cwd: process.cwd(), targetPath: context.path },
      "Git initialization skipped - already in git repository",
    );
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
  if (!context.flags.includes("initialize-git")) {
    debugGit.info(
      { flags: context.flags, targetPath: context.path },
      "Git initialization skipped - not flagged for initialization",
    );
    return;
  }

  if (!context.path) {
    debugGit.error(
      { flags: context.flags, targetPath: context.path },
      "Git initialization failed - no target path provided",
    );
    return;
  }

  debugGit.info(
    { targetPath: context.path, cwd: process.cwd() },
    "Starting git initialization",
  );

  const s = spinner();
  s.start("Initializing git repository...");

  try {
    debugGit.debug(
      { command: "git init", cwd: context.path },
      "Executing git init",
    );
    execSync("git init", {
      cwd: context.path,
      stdio: "ignore",
    });
    debugGit.debug(
      { command: "git init", cwd: context.path },
      "Git init completed successfully",
    );

    debugGit.debug(
      { command: "git add .", cwd: context.path },
      "Executing git add",
    );
    execSync("git add .", {
      cwd: context.path,
      stdio: "ignore",
    });
    debugGit.debug(
      { command: "git add .", cwd: context.path },
      "Git add completed successfully",
    );

    const commitMessage = "Initial commit: 🤖 create-fiberplane";
    debugGit.debug(
      { command: `git commit -m "${commitMessage}"`, cwd: context.path },
      "Executing git commit",
    );
    execSync(`git commit -m "${commitMessage}"`, {
      cwd: context.path,
      stdio: "ignore",
    });
    debugGit.debug(
      { command: `git commit -m "${commitMessage}"`, cwd: context.path },
      "Git commit completed successfully",
    );

    debugGit.info(
      { targetPath: context.path },
      "Git repository initialization completed successfully",
    );
    s.stop(`${pico.green("✓")} Git repository initialized`);
  } catch (error) {
    debugGit.error(
      {
        targetPath: context.path,
        error: error instanceof Error ? error.message : String(error),
      },
      "Git repository initialization failed",
    );
    s.stop(`${pico.red("✗")} Failed to initialize git repository`);
    throw error;
  }
}
