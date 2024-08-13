import type { Template } from "./types";
import { getPackageManager } from "./utils";

export interface Context {
  cwd: string;
  packageManager: string;
  path?: string;
  template?: Template;
}

export function getContext(): Context {
  return {
    cwd: process.cwd(),
    packageManager: getPackageManager() ?? "npm",
  };
}
