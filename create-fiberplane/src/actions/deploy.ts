import { confirm, spinner } from "@clack/prompts";
import { execSync } from "node:child_process";
import pico from "picocolors";
import type { Context } from "../context";

export async function promptDeploy(context: Context) {
  const deployFiberplane = await confirm({
    message: "Should we deploy this thing now?",
    initialValue: true,
  });

  if (deployFiberplane) {
    context.flags.push("deploy-fiberplane");
  }

  return deployFiberplane;
}

export async function actionDeploy(context: Context) {
  if (!context.flags.includes("deploy-fiberplane") || !context.path) {
    return;
  }

  const s = spinner();
  s.start("Deploying to Fiberplane...");

  try {
    // HACK - force login flow here until deploy does it automatically
    execSync(`${context.packageManager} fiberplane-cli auth login`, {
      cwd: context.path,
      stdio: "inherit", // Show output to user
    });

    // Execute the deploy script in the target project
    execSync(`${context.packageManager} run deploy`, {
      cwd: context.path,
      stdio: "inherit", // Show output to user
    });

    s.stop(`${pico.green("✓")} Deployment completed successfully`);

    console.log(`
${pico.cyan("🚀 Your MCP project is now live!")}

Your MCP server has been deployed to Fiberplane.
Visit your Fiberplane dashboard to manage your deployment.
`);
  } catch (error) {
    s.stop(`${pico.red("✗")} Deployment failed`);
    console.error(`
${pico.red("Deployment error:")} ${error instanceof Error ? error.message : "Unknown error"}

${pico.dim("Make sure:")}
• The template includes a "deploy" script in package.json
• You have proper Fiberplane credentials configured
• All dependencies are installed
`);
    throw error;
  }
}
