import type { Context } from "@/context";
import { cancel, isCancel, log, select, spinner } from "@clack/prompts";
import { downloadTemplate } from "giget";

export async function template(ctx: Context) {
  const result = await select({
    message: "Which template do you want to use?",
    options: [
      {
        value: "sample-api",
        label: "Sample API template",
        hint: "A configured sample API using the HONC stack",
      },
      {
        value: "bare",
        label: "Bare template",
        hint: "A barebones HONC project",
      },
    ],
    initialValue: "bare",
  });

  if (isCancel(result)) {
    cancel("create-honc-app cancelled 🪿");
    process.exit(0);
  }

  if (typeof result === "string") {
    ctx.template = result as "sample-api" | "bare";
  }

  if (!ctx.path) {
    log.error("Path is required");
    process.exit(1);
  }

  if (ctx.template === "sample-api") {
    const s = spinner();
    s.start("Setting up template...");
    await downloadTemplate("github:fiberplane/goose-quotes", {
      cwd: ctx.cwd,
      dir: ctx.path,
      force: true,
      provider: "github",
    });
    s.stop("Template set up successfully");
  }

  if (ctx.template === "bare") {
    // const baseTemplatePath = path.join(PKG_ROOT, "template");
    const s = spinner();
    s.start("Setting up template...");
    // fs.copySync(baseTemplatePath, path.join(ctx.cwd, ctx.path));
    await downloadTemplate(
      "github:fiberplane/honc-template/template#spoonfeeding",
      {
        cwd: ctx.cwd,
        dir: ctx.path,
        force: true,
        provider: "github",
      },
    );
    s.stop("Template set up successfully");
  }
}
