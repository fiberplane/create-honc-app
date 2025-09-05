import { spinner } from "@clack/prompts";
import { downloadTemplate } from "giget";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import pico from "picocolors";
import type { Context } from "../context";

const MCP_TEMPLATE_URL = "github:brettimus/moncy-bars/apps/echo"; // This would be the actual template URL

export async function actionTemplate(context: Context) {
  if (!context.path) {
    throw new Error("Path not set");
  }

  const s = spinner();
  s.start("Creating MCP project from template...");

  try {
    // Ensure the directory exists
    if (!existsSync(context.path)) {
      mkdirSync(context.path, { recursive: true });
    }

    // Download the MCP template
    await downloadTemplate(MCP_TEMPLATE_URL, {
      dir: context.path,
      force: true,
    });

    // Update package.json name field with the project directory name
    const packageJsonPath = join(context.path, "package.json");
    if (existsSync(packageJsonPath)) {
      try {
        const packageJsonContent = readFileSync(packageJsonPath, "utf-8");
        const packageJson = JSON.parse(packageJsonContent);

        // Set the name to the basename of the path (project directory name)
        packageJson.name = basename(context.path);

        // Write back the updated package.json
        writeFileSync(
          packageJsonPath,
          `${JSON.stringify(packageJson, null, 2)}\n`,
        );
      } catch (error) {
        // If package.json parsing fails, continue without updating
        console.warn(
          `${pico.yellow("⚠")} Could not update package.json name field`,
        );
      }
    }

    s.stop(`${pico.green("✓")} MCP template downloaded successfully`);
  } catch (error) {
    s.stop(`${pico.red("✗")} Failed to download template`);
    throw error;
  }
}
