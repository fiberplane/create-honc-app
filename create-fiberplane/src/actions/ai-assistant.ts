import { select } from "@clack/prompts";
import type { Context } from "../context";
import type { AIAssistant } from "../types";

export async function promptAIAssistant(context: Context) {
  const aiAssistant = await select({
    message: "Install AI assistance?",
    options: [
      { value: "cursor", label: "Cursor" },
      { value: "claude-code", label: "Claude Code" },
      { value: "vscode", label: "VSCode" },
      { value: "windsurf", label: "Windsurf" },
      { value: "none", label: "None" },
    ],
    initialValue: "cursor",
  });

  if (typeof aiAssistant === "string") {
    context.aiAssistant = aiAssistant as AIAssistant;
  }

  return aiAssistant;
}

export async function actionAIAssistant(context: Context) {
  if (!context.aiAssistant || context.aiAssistant === "none") {
    return;
  }

  // TODO - Add specific configuration files for each AI assistant

  // Here we would add specific configuration files for each AI assistant
  // For now, we'll just return success
  return;
}
