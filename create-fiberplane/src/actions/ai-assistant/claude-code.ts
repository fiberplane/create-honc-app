import { note, spinner } from "@clack/prompts";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import pico from "picocolors";
import type { Context } from "../../context";

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
      const mcpConfig = {
        mcpServers: {
          context7: {
            type: "http",
            url: "https://mcp.context7.com/mcp",
          },
          playwright: {
            type: "stdio",
            command: "npx",
            args: ["@playwright/mcp@latest"],
            env: {},
          },
          notion: {
            type: "http",
            url: "https://mcp.notion.com/mcp",
          },
          linear: {
            type: "http",
            url: "https://mcp.linear.app/mcp",
          },
        },
      };

      writeFileSync(mcpJsonPath, JSON.stringify(mcpConfig, null, 2));
    }

    // Create CLAUDE.md if it doesn't exist
    if (!existsSync(claudePath)) {
      const claudeContent = `# Claude Code Configuration

This file contains configuration and documentation for Claude Code integration in your MCP project.

## MCP Server Configuration

The \`.mcp.json\` file configures the Model Context Protocol servers available to Claude Code:

### Available Servers

- **Context7**: General-purpose context server
- **Playwright**: Browser automation and testing
- **Notion**: Notion workspace integration
- **Linear**: Linear project management integration

## Usage

1. Ensure your \`.mcp.json\` file is properly configured
2. Claude Code will automatically detect and use the MCP servers
3. Use the MCP capabilities within Claude Code for enhanced functionality

## Custom MCP Servers

To add your own MCP server:

\`\`\`json
{
  "mcpServers": {
    "your-server": {
      "type": "http",
      "url": "https://your-mcp-server.com/mcp"
    }
  }
}
\`\`\`

## Development

- Test your MCP servers locally before adding to production
- Document any custom MCP capabilities in this file
- Keep server URLs up to date
`;

      writeFileSync(claudePath, claudeContent);
    }

    s.stop(`${pico.green("✓")} Claude Code configuration created`);

    note(`${pico.cyan("Claude Code setup complete!")}
    
${pico.dim("Created:")}
• .mcp.json - MCP server configuration for Claude Code
• CLAUDE.md - Claude Code integration documentation

${pico.dim("Next steps:")}
• Configure your MCP server endpoints in .mcp.json
• Test MCP integration with Claude Code
• Document custom capabilities in CLAUDE.md`);
  } catch (error) {
    s.stop(`${pico.red("✗")} Failed to set up Claude Code configuration`);
    throw error;
  }
}
