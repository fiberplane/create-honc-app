import { getPackageManager } from "./utils";

export interface Context {
	cwd: string;
	packageManager: string;
	path?: string;
	template?: "sample-api" | "bare";
}

export function getContext(): Context {
	return {
		cwd: process.cwd(),
		packageManager: getPackageManager() ?? "npm",
	};
}
