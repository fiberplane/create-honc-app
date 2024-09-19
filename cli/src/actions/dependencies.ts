import type { Context } from "@/context";
import { runShell } from "@/utils";
import { confirm, log, spinner } from "@clack/prompts";
import path from "node:path";

export async function promptDependencies(
  ctx: Context,
): Promise<boolean | symbol> {
  const shouldInstallDeps = await confirm({
    message: "Do you want to install dependencies?",
    initialValue: true,
  });

  if (typeof shouldInstallDeps === "boolean" && shouldInstallDeps) {
    ctx.flags.push("install-dependencies");
  }

  return shouldInstallDeps;
}

export async function actionDependencies(ctx: Context): Promise<void> {
  if (!ctx.path) {
    log.error("Path is required");
    process.exit(1);
  }

  if (ctx.flags.includes("install-dependencies")) {
    const installDir = path.join(ctx.cwd, ctx.path);
    const s = spinner();
    try {
      s.start("Installing dependencies...");
      await runShell(installDir, [ctx.packageManager, "install"]);
      s.stop("Dependencies installed successfully");
    } catch (_error) {
      log.error("Dependencies installation failed");
      log.step(
        `Run npm install inside ${ctx.path} to install the dependencies manually`,
      );
    }
  }
}
