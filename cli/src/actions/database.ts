import type { Context } from "@/context";
import { cancel, isCancel, log, note, select, text } from "@clack/prompts";

export async function database(ctx: Context) {
  // NOTE: this is hardcoded for now but eventually we can branch off based on the user's choice
  //
  // log.step("The template is using Neon as a hosted Postgres database. We'll need to create a project in order to retrieve the connection key (postgres://...)")
  //
  // const projectName = await text({
  // 	message: "What is the name of your database project?",
  // 	placeholder: "my-project",
  // })
  //
  // if (isCancel(projectName)) {
  // 	cancel("create-honc-app cancelled 🪿");
  // 	process.exit(0);
  // }

  // FIXME: Neon stuff happens here...

  log.step("Setting up Neon:");
  note(`Create a Neon account and project, retrieve the connection key from the dashboard, and add it to your .dev.vars file.

DATABASE_URL=postgres://....
`);
  note(
    "Visit https://neon.tech/docs/get-started-with-neon/connect-neon to create an account and project.",
  );
}
