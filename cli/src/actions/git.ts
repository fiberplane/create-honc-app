import type { Context } from "@/context";
import { runShell } from "@/utils";
import { cancel, confirm, isCancel, log, spinner } from "@clack/prompts";
import path from "node:path";

export async function git(ctx: Context) {
  const confirmGit = await confirm({
    message:
      "Do you want to initialize a git repository and stage all the files?",
    initialValue: true,
    active: "yes",
  });

  if (isCancel(confirmGit)) {
    cancel("create-honc-app cancelled 🪿");
    process.exit(0);
  }

  if (!ctx.path) {
    log.error("Path is required, could not initialize git repository");
    process.exit(1);
  }

  if (confirmGit) {
    const gitDir = path.join(ctx.cwd, ctx.path);
    const s = spinner();
    s.start("Initializing git repository...");
    try {
      await runShell(gitDir, ["git", "init"]);
      await runShell(gitDir, ["git", "add", "."]);
    } catch (error) {
      log.error("Git repository initialization failed");
      log.step(
        "Run git init and git add . to initialize the repository manually",
      );
    }
    s.stop("Git repository initialized and files staged successfully");
  }
}
