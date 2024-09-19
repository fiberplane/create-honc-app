import type { Context } from "@/context";
import type { Template } from "@/types";
import { log, select, spinner } from "@clack/prompts";
import { downloadTemplate } from "giget";

export async function promptTemplate(ctx: Context): Promise<string | symbol> {
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

  if (typeof result === "string") {
    ctx.template = result as Template;
  }

  return result;
}

export async function actionTemplate(ctx: Context): Promise<void> {
  if (!ctx.path) {
    log.error("Path is required");
    process.exit(1);
  }

  const s = spinner();
  s.start("Setting up template...");

  let templateUrl: string;

  switch (ctx.template) {
    case "sample-api":
      templateUrl = "github:fiberplane/goose-quotes";
      break;
    case "base":
      templateUrl = "github:fiberplane/create-honc-app/templates/base";
      break;
    case "base-supa":
      templateUrl = "github:fiberplane/create-honc-app/templates/base-supa";
      break;
    default:
      throw new Error(`Invalid template selected: ${ctx.template}`);
  }

  await downloadTemplate(templateUrl, {
    cwd: ctx.cwd,
    dir: ctx.path,
    force: true,
    provider: "github",
  });

  s.stop("Template set up successfully");
}
