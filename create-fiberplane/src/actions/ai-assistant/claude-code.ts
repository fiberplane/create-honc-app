import { note, spinner } from "@clack/prompts";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import pico from "picocolors";
import type { Context } from "../../context";
import {
  AGENTS_MD,
  FIBERPLANE_MCP_NAME,
  FIBERPLANE_MCP_URL,
} from "./constants";

// NOTE - CC needs the `type: "http"` property
const CLAUDE_CODE_FIBERPLANE_MCP_CONFIG = {
  mcpServers: {
    [FIBERPLANE_MCP_NAME]: {
      type: "http",
      url: FIBERPLANE_MCP_URL,
    },
  },
};

export async function actionClaudeCode(context: Context) {
  if (!context.path) {
    throw new Error("Path not set");
  }

  const s = spinner();
  s.start("Setting up Claude Code configuration...");

  try {
    const mcpJsonPath = join(context.path, ".mcp.json");
    const claudePath = join(context.path, "CLAUDE.md");

    // Create .mcp.json if it doesn't exist
    if (!existsSync(mcpJsonPath)) {
      const mcpConfig = CLAUDE_CODE_FIBERPLANE_MCP_CONFIG;

      writeFileSync(mcpJsonPath, JSON.stringify(mcpConfig, null, 2));
    }

    // Create CLAUDE.md if it doesn't exist
    if (!existsSync(claudePath)) {
      const claudeContent = AGENTS_MD;

      writeFileSync(claudePath, claudeContent);
    }

    s.stop(`${pico.green("✓")} Claude Code configuration created`);

    note(`${pico.cyan("Claude Code setup complete!")}
    
${pico.dim("Created:")}
• CLAUDE.md
• .mcp.json with Fiberplane MCP server

Claude Code is ready to use Fiberplane.
`);
  } catch (error) {
    s.stop(`${pico.red("✗")} Failed to set up Claude Code configuration`);
    throw error;
  }
}
