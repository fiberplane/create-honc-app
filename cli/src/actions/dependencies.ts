import type { Context } from "@/context";
import { runShell } from "@/utils";
import { cancel, confirm, isCancel, spinner } from "@clack/prompts";

export async function dependencies(ctx: Context) {
  const shouldInstallDeps = await confirm({
    message: "Do you want to install dependencies?",
    initialValue: true,
  });

  if (isCancel(shouldInstallDeps)) {
    cancel("create-honc-app cancelled 🪿");
    process.exit(0);
  }

  if (shouldInstallDeps) {
    const s = spinner();
    s.start("Installing dependencies...");
    runShell([ctx.packageManager, "install"]);
    s.stop("Dependencies installed successfully");
  }
}
