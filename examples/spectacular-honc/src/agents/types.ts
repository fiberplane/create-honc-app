import type { AIChatAgent } from "agents-sdk/ai-chat-agent";
import type { streamText } from "ai";

export type AiEnv = {
  OPENAI_API_KEY: string;
};

export type AiOnFinishHandler = Parameters<AIChatAgent<AiEnv>["onChatMessage"]>[0];

export type AiMessages = Parameters<typeof streamText>[0]["messages"];
