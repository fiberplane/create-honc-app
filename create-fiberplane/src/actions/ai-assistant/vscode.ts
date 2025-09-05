import { note } from "@clack/prompts";
import pico from "picocolors";
import type { Context } from "../../context";

export async function actionVSCode(context: Context) {
  note(`${pico.yellow("TODO")} - VSCode configuration not yet implemented
  
${pico.dim("Planned features:")}
• .vscode/settings.json configuration
• Extension recommendations
• MCP extension setup`);
}
