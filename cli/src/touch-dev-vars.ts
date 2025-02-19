import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Context } from "./context";

/**
 * Touch a .dev.vars file if it doesn't exist.
 * @param context - The context object containing the project path.
 */
export function touchDevVars(context: Context): void {
  if (!context.path) {
    return;
  }

  try {
    const projectDir = join(context.cwd, context.path);

    const devVarsPath = join(projectDir, ".dev.vars");

    if (!existsSync(devVarsPath)) {
      writeFileSync(devVarsPath, "# add your environment variables here\n");
    }
  } catch {
    // Fail silently
  }
}
