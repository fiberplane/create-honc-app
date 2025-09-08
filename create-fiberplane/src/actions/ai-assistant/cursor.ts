import { note, spinner } from "@clack/prompts";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import pico from "picocolors";
import type { Context } from "../../context";
import { AGENTS_MD, FIBERPLANE_MCP_CONFIG } from "./constants";

/**
 * @NOTE - As of writing, nested AGENTS.md within a project are not supported
 *         So if someone installs this as a package-within-a-project, then AGENTS.md will not get pickedup.
 * @TODO - Add a `.cursor/rule` file...
 */
export async function actionCursor(context: Context) {
  if (!context.path) {
    throw new Error("Path not set");
  }

  const s = spinner();
  s.start("Setting up Cursor configuration...");

  try {
    const cursorDir = join(context.path, ".cursor");
    const mcpJsonPath = join(cursorDir, "mcp.json");
    const agentsPath = join(context.path, "AGENTS.md");

    // Create .cursor directory if it doesn't exist
    if (!existsSync(cursorDir)) {
      mkdirSync(cursorDir, { recursive: true });
    }

    // Create mcp.json if it doesn't exist
    if (!existsSync(mcpJsonPath)) {
      const mcpConfig = FIBERPLANE_MCP_CONFIG;

      writeFileSync(mcpJsonPath, JSON.stringify(mcpConfig, null, 2));
    }

    // Create AGENTS.md if it doesn't exist
    if (!existsSync(agentsPath)) {
      const agentsContent = AGENTS_MD;

      writeFileSync(agentsPath, agentsContent);
    }

    s.stop(`${pico.green("✓")} Cursor configuration created`);

    note(`${pico.cyan("Cursor setup complete!")}
    
${pico.dim("Created:")}
• AGENTS.md
• .cursor/mcp.json

Cursor is ready to use Fiberplane.
`);
  } catch (error) {
    s.stop(`${pico.red("✗")} Failed to set up Cursor configuration`);
    throw error;
  }
}
