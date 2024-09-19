import type { Context } from "@/context";
import { confirm } from "@clack/prompts";
import { neonSetupInstructions, runNeonSetup } from "./neon";
import { supabaseSetupInstructions } from "./supabase";

export async function promptDatabase(ctx: Context) {
  switch (ctx.template) {
    case "base-supa": {
      ctx.database = "supabase";
      break;
    }
    case "base": {
      ctx.database = "neon";
      const confirmNeonSetup = await confirm({
        message:
          "The selected template uses Neon, do you want the create-honc-app to set up the connection string for you?",
        initialValue: true,
      });

      if (typeof confirmNeonSetup === "boolean" && confirmNeonSetup) {
        ctx.flags.push("setup-neon");
      }

      // we're returning here so that in case the value isCancel we can handle it
      return confirmNeonSetup;
    }
  }

  return;
}

export async function actionDatabase(ctx: Context) {
  if (ctx.database === "supabase") {
    supabaseSetupInstructions();
    return;
  }
  if (ctx.database === "neon") {
    if (ctx.flags.includes("setup-neon")) {
      await runNeonSetup(ctx);
    } else {
      neonSetupInstructions();
    }
  }
}
