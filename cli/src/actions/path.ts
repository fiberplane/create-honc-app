import { existsSync, readdirSync } from "node:fs";
import { isAbsolute, parse } from "node:path";
import type { Context } from "@/context";
import { confirm, text } from "@clack/prompts";

export async function promptPath(ctx: Context) {
  try {
    const defaultValue = `./${ctx.name}`;
    const result = await text({
      message: "Where should we create your project? (./relative-path)",
      placeholder: defaultValue,
      defaultValue,
      validate: (value) => {
        if (value === "") {
          return undefined;
        }

        if (isAbsolute(value)) {
          return "Please enter a relative path.";
        }

        if (parse(value).ext) {
          return "Please enter a directory path.";
        }

        if (/[<>:"|?*]/.test(value) || /^\s+$/.test(value)) {
          return "Please enter a valid path.";
        }

        return undefined;
      },
    });

    if (typeof result === "symbol") {
      // Process cancelled or aborted
      return result;
    }

    if (existsSync(result) && readdirSync(result).length > 0) {
      const confirmation = await confirm({
        message: "Target directory isn't empty. Continue?",
        initialValue: false,
      });

      if (!confirmation) {
        process.exit(1);
      }
    }

    ctx.path = result;

    return result;
  } catch (error) {
    return error;
  }
}
