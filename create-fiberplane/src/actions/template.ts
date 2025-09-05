import { spinner } from "@clack/prompts";
import { downloadTemplate } from "giget";
import { existsSync, mkdirSync } from "node:fs";
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

    s.stop(`${pico.green("✓")} MCP template downloaded successfully`);
  } catch (error) {
    s.stop(`${pico.red("✗")} Failed to download template`);
    throw error;
  }
}
