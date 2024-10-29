import { log } from "@clack/prompts";

export function showSupabaseSetupInstructions() {
  log.step(
    "Setting up Supabase: Add your project's connection key to the .dev.vars file.",
  );
  log.step(
    "Visit https://supabase.com/docs/guides/database/connecting-to-supabase to create an account and project.",
  );
}
