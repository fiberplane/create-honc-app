import { spinner } from "@clack/prompts";
import { execSync } from "node:child_process";
import pico from "picocolors";
import type { Context } from "../context";

export async function promptDependencies(context: Context) {
  // NOTE - Minimize questions, just install dependencies
  const installDeps = true;

  // const installDeps = await confirm({
  //   message: "Install dependencies?",
  //   initialValue: true,
  // });

  if (installDeps) {
    context.flags.push("install-dependencies");
  }

  return installDeps;
}

export async function actionDependencies(context: Context) {
  if (!context.flags.includes("install-dependencies") || !context.path) {
    return;
  }

  const s = spinner();
  s.start("Installing dependencies...");

  try {
    execSync(`${context.packageManager} install`, {
      cwd: context.path,
      stdio: "ignore",
    });

    s.stop(`${pico.green("✓")} Dependencies installed successfully`);
  } catch (error) {
    s.stop(`${pico.red("✗")} Failed to install dependencies`);
    throw error;
  }
}
