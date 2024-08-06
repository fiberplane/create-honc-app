import type { Context } from "@/context";
import { runShell } from "@/utils";
import { cancel, confirm, isCancel, log, spinner } from "@clack/prompts";
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
    try {
      s.start("Installing dependencies...");
      await runShell(installDir, [ctx.packageManager, "install"]);
      s.stop("Dependencies installed successfully");
    } catch (error) {
      log.error("Dependencies installation failed");
      log.step(
        `Run npm install inside ${ctx.path} to install the dependencies manually`,
      );
    }
  }
}
