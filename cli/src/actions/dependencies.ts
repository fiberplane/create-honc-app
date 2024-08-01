import type { Context } from "@/context";
import { runShell } from "@/utils";
import { cancel, confirm, isCancel, log, note, spinner } from "@clack/prompts";
import path from "node:path";

export async function dependencies(ctx: Context) {
  const shouldInstallDeps = await confirm({
    message: "Do you want to install dependencies?",
    initialValue: true,
  });

  if (isCancel(shouldInstallDeps)) {
    cancel("create-honc-app cancelled 🪿");
    process.exit(0);
  }

  if (!ctx.path) {
    log.error("Path is required");
    process.exit(1);
  }

  if (shouldInstallDeps) {
    const installDir = path.join(ctx.cwd, ctx.path);
    const s = spinner();
    s.start("Installing dependencies...");
    try {
      runShell([ctx.packageManager, "install", "--prefix", installDir]);
    } catch (error) {
      log.error("Dependencies installation failed");
      note(
        `Run npm install inside ${ctx.path} to install the dependencies manually`,
      );
    }
    s.stop("Dependencies installed successfully");
  }
}
