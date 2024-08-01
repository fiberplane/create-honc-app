import { cancel, group, text, select } from "@clack/prompts";

export async function runPrompts() {
	return await group(
		{
			path: () =>
				text({
					message: "Where should we create your project? (./relative-path)",
					placeholder: "./spooking-honc",
					defaultValue: "./spooking-honc",
					validate: (value) => {
						if (!value) return "Please enter a path.";
						if (value[0] !== ".") return "Please enter a relative path.";
					},
				}),
			template: () =>
				select({
					message: "Which template do you want to use?",
					options: [
						{
							value: "sample-api",
							label: "Sample API template",
							hint: "A configured sample API using the HONC stack",
						},
						{ value: "bare", label: "Bare template", hint: "A barebones HONC project" },
					],
					initialValue: "bare",
				}),
			orm: ({ results }) => {
				// if sample-api, don't ask for ORM
				if (results.template === "sample-api") return;
				return select({
					message: "Which ORM do you want to use?",
					options: [
						{
							title: "Drizzle",
							value: "drizzle",
							hint: "The only one supported at the moment",
						},
					],
					initialValue: "drizzle",
				});
			},
			database: ({ results }) => {
				if (results.template === "sample-api") return;
				return select({
					message: "Which database do you want to use?",
					options: [
						{
							title: "Neon",
							value: "neon",
							hint: "The only one supported at the moment",
						},
					],
					initialValue: "neon",
				});
			},
			dbProjectName: ({ results }) => {
				if (results.template === "sample-api") return;
				return text({
					message: "What is the name of your database project?",
					placeholder: "my-project",
				});
			},
		},
		{
			onCancel: () => {
				cancel("Installation cancelled 🪿");
				process.exit(0);
			},
		},
	);
}
