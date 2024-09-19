import type { Context } from "@/context";
import { getNeonAuthToken } from "@/integrations/neon";
import fs from "node:fs";
import { isCancel, log, select } from "@clack/prompts";
import { createApiClient } from "@neondatabase/api-client";

/*
 * Used if the user rejects the Neon setup flow
 */
export function showNeonSetupInstructions() {
  log.step("Setting up Neon:");
  log.step(`Create a Neon account and project, retrieve the connection key from the dashboard, and add it to your .dev.vars file.

DATABASE_URL=postgres://....
`);
  log.step(
    "Visit https://neon.tech/docs/get-started-with-neon/connect-neon to create an account and project.",
  );
}

export async function runNeonSetup(ctx: Context) {
  log.step(`Setting up Neon:

		In order to connect to your database project and retrieve the connection key, you'll need to authenticate with Neon.

		The connection URI will be written to your .dev.vars file as DATABASE_URL. The token itself will *NOT* be stored anywhere after this session is complete.
		`);

  try {
    const token = await getNeonAuthToken();
    const neon = createApiClient({ apiKey: token.access_token });

    const project: string | symbol = await select({
      message: "Select a project to use:",
      options: (
        await Promise.all([
          ...(await neon.listProjects({})).data.projects,
          ...(await neon.listSharedProjects({})).data.projects,
        ])
      ).map((project) => ({
        label: project.name,
        value: project.id,
        hint: `Last updated: ${project.updated_at}${project.org_id ? ` (Shared project, Org ID: ${project.org_id})` : ""}`,
      })),
    });

    if (isCancel(project)) {
      return project;
    }

    const branch: string | symbol = await select({
      message: "Select a branch to use:",
      options: (await neon.listProjectBranches(project)).data.branches.map(
        (branch) => ({
          label: branch.name,
          value: branch.id,
          hint: `Last updated: ${branch.updated_at}`,
        }),
      ),
    });

    if (isCancel(branch)) {
      return branch;
    }

    const database: string | symbol = await select({
      message: "Select a database to use:",
      options: (
        await neon.listProjectBranchDatabases(project, branch as string)
      ).data.databases.map((database) => ({
        label: database.name,
        value: database.id.toString(),
        hint: `Last updated: ${database.updated_at}`,
      })),
    });

    if (isCancel(database)) {
      return database;
    }

    const role: string | symbol = await select({
      message: "Select a role to use:",
      options: (
        await neon.listProjectBranchRoles(project, branch as string)
      ).data.roles.map((r) => ({
        label: r.name,
        value: r.name,
        hint: `Last updated: ${r.updated_at}`,
      })),
    });

    if (isCancel(role)) {
      return role;
    }

    const connectionUri = (
      await neon.getConnectionUri({
        role_name: role,
        projectId: project,
        database_name: database,
      })
    ).data.uri;

    ctx.databaseConnectionString = connectionUri;

    log.step("Writing connection string to .dev.vars file");

    fs.writeFileSync(
      `${ctx.path}/.dev.vars`,
      `DATABASE_URL=${connectionUri}\n`,
    );

    return;
  } catch (error) {
    return error;
  }
}
