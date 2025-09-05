import { note, spinner } from "@clack/prompts";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import pico from "picocolors";
import type { Context } from "../../context";

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
      const mcpConfig = {
        mcpServers: {
          "fiberplane-mcp-server": {
            url: "https://fiberplane.com/mcp",
            headers: {},
          },
        },
      };

      writeFileSync(mcpJsonPath, JSON.stringify(mcpConfig, null, 2));
    }

    // Create AGENTS.md if it doesn't exist
    if (!existsSync(agentsPath)) {
      const agentsContent = `# AI Agents Configuration

This file contains configuration and documentation for AI agents in your MCP project.

## Available Agents

### Your MCP Server Agent
- **Endpoint**: https://your-mcp-server.com/mcp
- **Description**: Main MCP server for this project
- **Capabilities**: [To be documented]

## Usage

Configure your AI assistant to use the MCP servers defined in \`.cursor/mcp.json\`.

## Development

Add your custom MCP server configurations here as you develop new capabilities.
`;

      writeFileSync(agentsPath, agentsContent);
    }

    s.stop(`${pico.green("✓")} Cursor configuration created`);

    note(`${pico.cyan("Cursor setup complete!")}
    
${pico.dim("Created:")}
• .cursor/mcp.json - MCP server configuration
• AGENTS.md - AI agents documentation

${pico.dim("Next steps:")}
• Update the MCP server URL in .cursor/mcp.json
• Configure your MCP server endpoints
• Document your agents in AGENTS.md`);
  } catch (error) {
    s.stop(`${pico.red("✗")} Failed to set up Cursor configuration`);
    throw error;
  }
}
