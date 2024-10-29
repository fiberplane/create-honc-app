import type { ScaffoldedFiles } from "@/integrations/code-gen";
import type { Flags, Template } from "./types";
import { getPackageManager } from "./utils";

export interface Context {
  cwd: string;
  packageManager: string;
  path?: string;
  description?: string;
  template?: Template;
  database?: string;
  flags: Flags;
  databaseConnectionString?: string;

  indexFile?: string;
  schemaFile?: string;
  seedFile?: string;

  /**
   * A random id for the current session.
   * This is used to reference the current session in the honc-code-gen API.
   */
  sessionId: string;

  /**
   * The base URL for the honc-code-gen API.
   */
  codeGenBaseUrl?: string;

  /**
   * The API key for the honc-code-gen API.
   */
  codeGenApiKey?: string;

  /**
   * Promise that resolves to the scaffolded files.
   *
   * @remarks
   * We save the promise that resolves to the scaffolded files in context so that the code can generated in the background,
   * while we install dependencies and finish setting up the project.
   * This is because API requests to generate code from honc-code-gen are slowww
   */
  codeGenPromise: Promise<ScaffoldedFiles | null>;

  /**
   * The value of the --hatch flag.
   * E.g., `--hatch=abc123`
   *
   * @remarks
   * If the flag is not present, this will be `false`,
   *   and there shall be no goslings.
   *
   * If the flag is present, this will be the value of the flag,
   *   in which case we will attempt to install a hatched template
   *   from a remote source.
   *
   * If the flag is present with no value, this will be `true`,
   *   in which case we will kick off the code generation flow!
   */
  hatchValue: string | boolean;
}

export function initContext(): Context {
  const hatchValue = parseHatchFlag(process.argv);
  const flags: Flags = hatchValue ? ["hatch"] : [];

  return {
    cwd: process.cwd(),
    packageManager: getPackageManager() ?? "npm",
    flags,

    hatchValue,

    // TODO - Improve this random id and concatenate with project name somehow
    sessionId: Math.random().toString(36).substring(2),
    codeGenApiKey: process.env.HONC_API_KEY,
    codeGenBaseUrl: process.env.HONC_BASE_URL,
    codeGenPromise: Promise.resolve(null),
  };
}

/**
 * Parses the --hatch flag from command line arguments.
 *
 * @param args - An array of command line arguments.
 * @returns
 *   - `false` if the --hatch flag is not present.
 *   - A `string` value if a valid value is provided with the flag.
 *   - `true` if the flag is present but without a valid value.
 *
 * @description
 * This function searches for the --hatch flag in the command line arguments and interprets its value:
 *
 * 1. If the flag is not found, it returns `false`.
 * 2. If the flag is found with a value (e.g., --hatch=abc123), it returns the value if it's alphanumeric with hyphens.
 * 3. If the flag is found without a value but the next argument is alphanumeric with hyphens, it returns that next argument.
 * 4. In all other cases where the flag is present, it returns `true`.
 *
 * Valid values for the flag are strings containing only letters, numbers, and hyphens.
 *
 * @example
 * parseHatchFlag(["--hatch=abc123"]) // Returns "abc123"
 * parseHatchFlag(["--hatch", "def-456"]) // Returns "def-456"
 * parseHatchFlag(["--hatch"]) // Returns true
 * parseHatchFlag(["--other-flag"]) // Returns false
 */
function parseHatchFlag(args: string[]): string | boolean {
  const hatchIndex = args.findIndex((arg) => arg.startsWith("--hatch"));

  if (hatchIndex === -1) {
    return false;
  }

  const hatchArg = args[hatchIndex];
  const parts = hatchArg.split("=");

  if (parts.length > 1) {
    // If there's a value after =, use it
    return parts[1].match(/^[a-zA-Z0-9-]+$/) ? parts[1] : true;
  }
  if (args[hatchIndex + 1] && /^[a-zA-Z0-9-]+$/.test(args[hatchIndex + 1])) {
    // If the next argument is alphanumeric with hyphens, use it
    return args[hatchIndex + 1];
  }
  // Otherwise, just set it to true
  return true;
}
