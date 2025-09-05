import { note, select } from "@clack/prompts";
import pico from "picocolors";
import type { Context } from "../../context";
import type { AIAssistant } from "../../types";
import { actionCursor } from "./cursor";
import { actionClaudeCode } from "./claude-code";
import { actionVSCode } from "./vscode";
import { actionWindsurf } from "./windsurf";

export async function promptAIAssistant(context: Context) {
  const aiAssistant = await select({
    message: "Who is your copilot?",
    options: [
      { value: "cursor", label: "Cursor" },
      { value: "claude-code", label: "Claude Code" },
      { value: "vscode", label: "VSCode" },
      { value: "windsurf", label: "Windsurf" },
      { value: "none", label: "I do it old school" },
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

  switch (context.aiAssistant) {
    case "cursor":
      return await actionCursor(context);
    case "claude-code":
      return await actionClaudeCode(context);
    case "vscode":
      return await actionVSCode(context);
    case "windsurf":
      return await actionWindsurf(context);
    default:
      note(`${pico.gray("No AI assistant selected - skipping setup")}`);
      return;
  }
}
