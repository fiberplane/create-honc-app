import type { Context } from "@/context";
import { getNeonAuthToken } from "@/integrations/neon/auth";
import { log, select } from "@clack/prompts";
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

	const token = await getNeonAuthToken();
	const neon = createApiClient({ apiKey: token.access_token });

	const projects = await neon.listProjects({});
	const sharedProjects = await neon.listSharedProjects({});
	const optionsProjects = projects.data.projects.concat(sharedProjects.data.projects).map((project) => ({
		label: project.name,
		value: project.id,
		hint: `Last updated: ${project.updated_at}${project.org_id ? ` (Shared project, Org ID: ${project.org_id})` : ''}`,
	}));

	const selectedProject = (await select({
		message: "Select a project to use:",
		options: optionsProjects,
	})) as string;

	const branches = await neon.listProjectBranches(selectedProject);

	const selectedBranch = (await select({
		message: "Select a branch to use:",
		options: branches.data.branches.map((branch) => ({
			label: branch.name,
			value: branch.id,
			hint: `Last updated: ${branch.updated_at}`,
		})),
	})) as string;

	const optionsDatabases = await neon.listProjectBranchDatabases(selectedProject, selectedBranch)

	const selectedDatabase = (await select({
		message: "Select a database to use:",
		options: optionsDatabases.data.databases.map((database) => ({
			label: database.name,
			value: database.id.toString(),
			hint: `Last updated: ${database.updated_at}`,
		})),
	})) as string;

	const roles = await neon.listProjectBranchRoles(selectedProject, selectedBranch);

	const selectedRole = (await select({
		message: "Select a role to use:",
		options: roles.data.roles.map((role) => ({
			label: role.name,
			value: role.name,
			hint: `Last updated: ${role.updated_at}`,
		})),
	})) as string;

	const connectionUri = (await neon.getConnectionUri({
		role_name: selectedRole,
		projectId: selectedProject,
		database_name: selectedDatabase,
	})).data.uri;

}
