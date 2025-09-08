export const FIBERPLANE_MCP_NAME = "fiberplane-mcp-server";
export const FIBERPLANE_MCP_URL = "https://fiberplane.com/mcp";

export const FIBERPLANE_MCP_CONFIG = {
  mcpServers: {
    [FIBERPLANE_MCP_NAME]: {
      url: FIBERPLANE_MCP_URL,
      headers: {},
    },
  },
};

export const AGENTS_MD = `# AI Coding Agent Instructions

This is a modern Typescript web application. 

It creates a Model Context Protocol (MCP) server, which can be connected to by MCP Clients (AI assistants) such as:

- Claude Desktop
- Claude Code
- Cursor
- VSCode + GitHub Copilot
- Windsurf

## Stack

This project is deployed to Fiberplane, which is equivalent to a Cloudflare serverless runtime.

## Workflow

Keep this file up to date with succinct descriptions of the project purpose, architecture, integrations, and other important information.

### Development

This project does not support local development.

Your workflow should be that, after you make changes, you run \`pnpm run deploy\` to deploy the changes to Fiberplane.
`;
