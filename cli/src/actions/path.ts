import type { Context } from "@/context";
import { cancel, isCancel, text } from "@clack/prompts";

//TODO: validate path
export async function path(ctx: Context) {
  const result = await text({
    message: "Where should we create your project? (./relative-path)",
    placeholder: "./spooking-honc",
    defaultValue: "./spooking-honc",
    validate: (value) => {
      if (!value) return "Please enter a path.";
      if (value[0] !== ".") return "Please enter a relative path.";
    },
  });

  if (isCancel(result)) {
    cancel("create-honc-app cancelled 🪿");
    process.exit(0);
  }

  if (typeof result === "string") {
    ctx.path = result;
  }
}
