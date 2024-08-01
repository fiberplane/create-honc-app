import { execSync } from "node:child_process";

export function getPackageManager() {
  return process.env.npm_config_user_agent?.split("/").at(0);
}

export function runShell(commands: string[]): void {
  const command = commands.join(" ");
  try {
    execSync(command, { stdio: "ignore" });
  } catch (error) {
    throw new Error(`Command execution failed: ${error.message}`);
  }
}
