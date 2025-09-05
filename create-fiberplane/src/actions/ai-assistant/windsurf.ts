import { note } from "@clack/prompts";
import pico from "picocolors";
import type { Context } from "../../context";

export async function actionWindsurf(context: Context) {
  note(`${pico.yellow("TODO")} - Windsurf configuration not yet implemented
  
${pico.dim("Planned features:")}
• Windsurf project configuration
• AI workflow setup
• MCP integration`);
}
