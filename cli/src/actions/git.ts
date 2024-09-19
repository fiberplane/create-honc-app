import type { Context } from "@/context";
import { runShell } from "@/utils";
import { confirm, log, spinner } from "@clack/prompts";
import path from "node:path";

export async function promptGit(ctx: Context): Promise<boolean | symbol> {
  const confirmGit = await confirm({
    message:
      "Do you want to initialize a git repository and stage all the files?",
    initialValue: true,
    active: "yes",
  });

  if (typeof confirmGit === "boolean" && confirmGit) {
    ctx.flags.push("initialize-git");
  }

  return confirmGit;
}

export async function actionGit(ctx: Context): Promise<void> {
  if (!ctx.path) {
    log.error("Path is required, could not initialize git repository");
    process.exit(1);
  }

  if (ctx.flags.includes("initialize-git")) {
    const gitDir = path.join(ctx.cwd, ctx.path);
    const s = spinner();
    s.start("Initializing git repository...");
    try {
      await runShell(gitDir, ["git", "init"]);
      await runShell(gitDir, ["git", "add", "."]);
      s.stop("Git repository initialized and files staged successfully");
    } catch (error) {
      s.stop("Git repository initialization failed");
      log.error("Git repository initialization failed");
      log.step(
        "Run git init and git add . to initialize the repository manually",
      );
    }
  }
}
