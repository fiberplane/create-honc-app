import type { Context } from "@/context";
import { cancel, isCancel, text } from "@clack/prompts";

//TODO: validate path
export async function path(ctx: Context) {
  const placeholder = "./spooking-honc";
  const result = await text({
    message: "Where should we create your project? (./relative-path)",
    placeholder,
    defaultValue: placeholder,
    validate: (value) => {
      if (value !== "" && value[0] !== ".")
        return "Please enter a relative path.";
    },
  });

  if (isCancel(result)) {
    cancel("create-honc-app cancelled 🪿");
    process.exit(0);
  }

  if (typeof result === "string") {
    if (result === "") ctx.path = placeholder;
    else ctx.path = result;
  }
}
