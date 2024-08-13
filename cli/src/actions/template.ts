import type { Context } from "@/context";
import type { Template } from "@/types";
import { cancel, isCancel, log, select, spinner } from "@clack/prompts";
import { downloadTemplate } from "giget";

export async function template(ctx: Context) {
  const result = await select({
    message: "Which template do you want to use?",
    options: [
      {
        value: "base",
        label: "Base template",
        hint: "A barebones HONC project with a Neon database",
      },
      {
        value: "base-supa",
        label: "(Supa)base template",
        hint: "A barebones HONC project with a Supabase database",
      },
      {
        value: "sample-api",
        label: "Sample API template",
        hint: "A configured sample API using the HONC stack",
      },
    ],
    initialValue: "base",
  });

  if (isCancel(result)) {
    cancel("create-honc-app cancelled 🪿");
    process.exit(0);
  }

  if (typeof result === "string") {
    ctx.template = result as Template;
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

  if (ctx?.template === "base") {
    const s = spinner();
    s.start("Setting up template...");
    await downloadTemplate("github:fiberplane/create-honc-app/templates/base#extra-templates", {
      cwd: ctx.cwd,
      dir: ctx.path,
      force: true,
      provider: "github",
    });
    s.stop("Template set up successfully");
  }

  if (ctx?.template === "base-supa") {
    const s = spinner();
    s.start("Setting up template...");
    await downloadTemplate("github:fiberplane/create-honc-app/templates/base-supa#extra-templates", {
      cwd: ctx.cwd,
      dir: ctx.path,
      force: true,
      provider: "github",
    });
    s.stop("Template set up successfully");
  }
}
