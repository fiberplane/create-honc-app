import type { Context } from "@/context";
import { log } from "@clack/prompts";

export async function database(_ctx: Context) {
  // NOTE: this is hardcoded for now but eventually we can branch off based on the user's choice
	//
  log.step("Setting up Neon:");
  log.step(`Create a Neon account and project, retrieve the connection key from the dashboard, and add it to your .dev.vars file.

DATABASE_URL=postgres://....
`);
  log.step(
    "Visit https://neon.tech/docs/get-started-with-neon/connect-neon to create an account and project.",
  );
}
