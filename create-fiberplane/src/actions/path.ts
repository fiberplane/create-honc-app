import { text } from "@clack/prompts";
import { existsSync } from "node:fs";
import { join } from "node:path";
import pico from "picocolors";
import type { Context } from "../context";

export async function promptPath(context: Context) {
  const path = await text({
    message: "Name of folder?",
    placeholder: context.name,
    defaultValue: context.name,
    validate: (value) => {
      if (!value) {
        return "Please enter a folder name";
      }
      if (existsSync(join(context.cwd, value))) {
        return `Folder ${pico.red(value)} already exists`;
      }
    },
  });

  if (typeof path === "string") {
    context.name = path;
    context.path = join(context.cwd, path);
  }

  return path;
}
