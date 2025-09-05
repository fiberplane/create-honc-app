import { text } from "@clack/prompts";
import { existsSync } from "node:fs";
import { join } from "node:path";
import pico from "picocolors";
import type { Context } from "../context";

export async function promptPath(context: Context) {
  let path = await text({
    message: "Target directory?",
    placeholder: context.name,
    defaultValue: context.name,
    validate: (value) => {
      const cleanedValue = value?.trim();
      if (!cleanedValue) {
        return "Please enter a folder name";
      }
      if (existsSync(join(context.cwd, cleanedValue))) {
        return `Folder ${pico.red(cleanedValue)} already exists`;
      }
      return undefined;
    },
  });

  if (typeof path === "string") {
    path = path.trim();
    context.name = path;
    context.path = join(context.cwd, path);
  }

  return path;
}
