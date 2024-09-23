import type { Context } from "@/context";
import { getNeonAuthToken } from "@/integrations/neon";
import fs from "node:fs";
import { isCancel, log, select, text } from "@clack/prompts";
import { type Api, createApiClient } from "@neondatabase/api-client";

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

    log.success("Neon authentication successful");

    const neon = createApiClient({ apiKey: token.access_token });

    const neonProjects = await Promise.all([
      ...(await neon.listProjects({})).data.projects,
      ...(await neon.listSharedProjects({})).data.projects,
    ]);

    const projectOptions = neonProjects.map((project) => ({
      label: project.name,
      value: project.id,
      hint: `Last updated: ${project.updated_at}${project.org_id ? ` (Shared project, Org ID: ${project.org_id})` : ""}`,
    }));

    projectOptions.push({
      label: "Create a new project",
      value: "cha-create-project",
      hint: "Create a new project using the create-honc-app",
    });

    const project: string | symbol = await select({
      message: "Select a Neon project to use:",
      options: projectOptions,
    });

    if (isCancel(project)) {
      return project;
    }

    if (project === "cha-create-project") {
      return await createProject(neon, ctx);
    }

    const branch: string | symbol = await select({
      message: "Select a project branch to use:",
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
      message: "Select a database you want to connect to:",
      options: (
        await neon.listProjectBranchDatabases(project, branch as string)
      ).data.databases.map((database) => ({
        label: database.name,
        value: database.name,
        hint: `Last updated: ${database.updated_at}`,
      })),
    });

    if (isCancel(database)) {
      return database;
    }

    const role: string | symbol = await select({
      message: "Select which role to use to connect to the database:",
      initialValue: "neondb-owner",
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

    const connectionUriResp = await neon.getConnectionUri({
      role_name: role,
      projectId: project,
      database_name: database,
    });

    const connectionUri = connectionUriResp.data.uri;

    ctx.databaseConnectionString = connectionUri;

    await recordConnectionUri(ctx, connectionUri);

    return;
  } catch (error) {
    return error;
  }
}

async function createProject(neon: Api<unknown>, ctx: Context) {
  const projectName = await text({
    message: "What is the name of the project?",
    validate: (value) => {
      if (value === "") {
        return "Please enter a project name.";
      }
    },
  });

  if (isCancel(projectName)) {
    return projectName;
  }

  const project = await neon.createProject({
    project: {
      name: projectName,
    },
  });

  log.success(
    `Project created successfully: ${project.data.project.name} on branch: ${project.data.branch.name}`,
  );

  project.data.connection_uris.map((connectionUri) => {
    recordConnectionUri(ctx, connectionUri.connection_uri);
  });
}

async function recordConnectionUri(ctx: Context, connectionUri: string) {
  log.step("Writing connection string to .dev.vars file");

  fs.writeFileSync(`${ctx.path}/.dev.vars`, `DATABASE_URL=${connectionUri}\n`);

  log.success("Neon connection string written to .dev.vars file");
  return;
}
