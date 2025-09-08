import { note, spinner } from "@clack/prompts";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import pico from "picocolors";
import type { Context } from "../../context";
import {
  AGENTS_MD,
  FIBERPLANE_MCP_NAME,
  FIBERPLANE_MCP_URL,
} from "./constants";

export async function actionVSCode(context: Context) {
  if (!context.path) {
    throw new Error("Path not set");
  }

  const s = spinner();
  s.start("Setting up VSCode configuration...");

  try {
    const vscodeDir = join(context.path, ".vscode");
    const mcpJsonPath = join(vscodeDir, "mcp.json");
    const githubDir = join(context.path, ".github");
    const copilotInstructionsPath = join(githubDir, "copilot-instructions.md");

    // Create .vscode directory if it doesn't exist
    if (!existsSync(vscodeDir)) {
      mkdirSync(vscodeDir, { recursive: true });
    }

    // Create .vscode/mcp.json if it doesn't exist
    if (!existsSync(mcpJsonPath)) {
      const mcpConfig = {
        servers: {
          [FIBERPLANE_MCP_NAME]: {
            type: "http",
            url: FIBERPLANE_MCP_URL,
            headers: {},
          },
        },
      } as const;

      writeFileSync(mcpJsonPath, JSON.stringify(mcpConfig, null, 2));
    }

    // Ensure .github directory exists
    if (!existsSync(githubDir)) {
      mkdirSync(githubDir, { recursive: true });
    }

    // Create .github/copilot-instructions.md if it doesn't exist
    if (!existsSync(copilotInstructionsPath)) {
      const agentsContent = AGENTS_MD;

      writeFileSync(copilotInstructionsPath, agentsContent);
    }

    s.stop(`${pico.green("✓")} VSCode configuration created`);

    note(`${pico.cyan("VSCode setup complete!")}
    
${pico.dim("Created:")}
• .github/copilot-instructions.md
• .vscode/mcp.json

VSCode is ready to use Fiberplane.
`);
  } catch (error) {
    s.stop(`${pico.red("✗")} Failed to set up VSCode configuration`);
    throw error;
  }
}
