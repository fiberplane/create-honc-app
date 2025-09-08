import { cancel } from "@clack/prompts";
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import pico from "picocolors";
import { CANCEL_MESSAGE } from "./const";

export function handleCancel(): never {
  cancel(CANCEL_MESSAGE);
  process.exit(0);
}

export function handleError(error: Error): never {
  console.error(pico.red(`❌ ${error.message}`));
  process.exit(1);
}

export function getPackageManager(): string | undefined {
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

export function isInGitRepo(path?: string): boolean {
  try {
    execSync("git rev-parse --is-inside-work-tree", {
      stdio: "ignore",
      cwd: path,
    });
    return true;
  } catch {
    return false;
  }
}

export function hasPackageJson(path: string): boolean {
  return existsSync(join(path, "package.json"));
}
