import { mkdirSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join } from "node:path";
import pino from "pino";

/**
 * Get the OS-appropriate log directory for create-fiberplane
 */
function getLogDirectory(): string {
  const home = homedir();

  switch (platform()) {
    case "darwin": // macOS
      return join(home, "Library", "Logs", "create-fiberplane");
    case "win32": {
      // Windows
      const localAppData =
        process.env.LOCALAPPDATA || join(home, "AppData", "Local");
      return join(localAppData, "create-fiberplane", "Logs");
    }
    default: {
      // Linux and others
      const xdgStateHome =
        process.env.XDG_STATE_HOME || join(home, ".local", "state");
      return join(xdgStateHome, "create-fiberplane", "logs");
    }
  }
}

/**
 * Create log directory if it doesn't exist
 */
function ensureLogDirectory(logDir: string): void {
  try {
    mkdirSync(logDir, { recursive: true });
  } catch (error) {
    // If we can't create the log directory, logging will be disabled
    console.warn(`Warning: Could not create log directory ${logDir}:`, error);
  }
}

/**
 * Generate log filename with timestamp and PID
 */
function getLogFileName(): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19); // YYYY-MM-DDTHH-MM-SS
  const pid = process.pid;
  return `create-fiberplane-${timestamp}-${pid}.log`;
}

/**
 * Create and configure the Pino logger
 */
function createLogger() {
  const logDir = getLogDirectory();
  ensureLogDirectory(logDir);

  const logFile = join(logDir, getLogFileName());

  // Create transport for file logging only
  // Console logging is disabled to avoid interfering with Clack prompts
  const transport = pino.transport({
    target: "pino/file",
    options: { destination: logFile },
    level: "debug", // Log everything to file
  });

  const logger = pino(
    {
      level: "debug", // Allow all levels, transport will filter
      base: {
        pid: process.pid,
        version: process.env.npm_package_version || "unknown",
        node: process.version,
        platform: platform(),
      },
    },
    transport,
  );

  // Log the log file location on startup
  logger.info({ logFile }, "Logging initialized");

  return logger;
}

// Create singleton logger instance
export const logger = createLogger();

// Export debug-specific loggers for different namespaces
export const debugGit = logger.child({ namespace: "git" });
export const debugHttp = logger.child({ namespace: "http" });
export const debugDeps = logger.child({ namespace: "deps" });
export const debugAI = logger.child({ namespace: "ai-assistant" });
