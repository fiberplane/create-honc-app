# create-fiberplane

An interactive CLI to create MCP (Model Context Protocol) projects with Fiberplane.

## Usage

```bash
npm create fiberplane@latest [project-name]
```

## Features

- 🚀 Interactive project setup
- 📦 Automatic dependency installation
- 🤖 AI assistant integration (Cursor, Claude Code, VSCode, Windsurf)
- 🔧 Git initialization
- ☁️ Fiberplane deployment configuration
- 📋 MCP template scaffolding

## Flow

1. **Target directory?** - Project directory name (default: "echo-mcp")
2. **Install AI assistance?** - Choose your preferred AI coding assistant
3. **Install dependencies?** - Automatically install project dependencies
4. **Initialize git?** - Set up git repository (skipped if already in a git repo)
5. **"Make it live" (Deploy with Fiberplane?)** - Configure Fiberplane deployment

## Development

```bash
# Install dependencies
pnpm install

# Build the CLI
pnpm build

# Test locally
pnpm dev

# Format code
pnpm format
```

## License

MIT
