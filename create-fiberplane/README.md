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

## Debugging

The CLI includes comprehensive logging to help debug issues. Logs are automatically saved to:

- **macOS**: `~/Library/Logs/create-fiberplane/`
- **Linux**: `~/.local/state/create-fiberplane/logs/`
- **Windows**: `%LOCALAPPDATA%\create-fiberplane\Logs\`

### View Debug Logs

All CLI operations are automatically logged to files for debugging:

```bash
# Check the logs (macOS example)
tail -f ~/Library/Logs/create-fiberplane/create-fiberplane-*.log

# Or view the latest log file
ls -t ~/Library/Logs/create-fiberplane/ | head -1 | xargs -I {} cat ~/Library/Logs/create-fiberplane/{}
```

### Environment Variables

- `CFP_LOG_DIR=/custom/path` - Override log directory (optional)

**Note**: All debug information is automatically logged to files to avoid interfering with the interactive CLI prompts.

## Development

```bash
# Install dependencies
pnpm install

# Build the CLI
pnpm build

# Test locally
pnpm dev

# Test locally (check log files for debug output)
pnpm dev

# Format code
pnpm format
```

## License

MIT
