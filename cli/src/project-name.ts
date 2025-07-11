import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { parse } from "node:path";
import { join } from "node:path";
import { PROJECT_NAME } from "./const";
import type { Context } from "./context";

/**
 * Update the project name in the package.json and wrangler.toml files.
 * Update the project description in the package.json file.
 * @param context - The context object containing the project path.
 */
export function updateProjectName(context: Context): void {
  if (!context.path) {
    // This condition should never pass
    return;
  }

  const projectName =
    context.name === PROJECT_NAME ? parse(context.path).name : context.name;

  const projectDir = join(context.cwd, context.path);

  // Update package.json
  const packageJsonPath = join(projectDir, "package.json");
  if (existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      packageJson.name = projectName;
      packageJson.description = `A lightweight Hono backend with a ${upperFirst(context.database)} database`;

      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    } catch {
      // Fail silently
    }
  }

  // Update wrangler.toml
  const wranglerTomlPath = join(projectDir, "wrangler.toml");
  if (existsSync(wranglerTomlPath)) {
    try {
      let wranglerToml = readFileSync(wranglerTomlPath, "utf-8");
      wranglerToml = wranglerToml.replace(
        /^name = ".*"$/m,
        `name = "${projectName}"`,
      );
      writeFileSync(wranglerTomlPath, wranglerToml);
    } catch {
      // Fail silently
    }
  }
}

export function upperFirst(text: string | undefined) {
  if (!text) {
    return text;
  }

  return text[0].toUpperCase() + text.slice(1);
}
