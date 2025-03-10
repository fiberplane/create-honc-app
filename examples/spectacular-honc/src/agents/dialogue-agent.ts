import { AIChatAgent } from "agents-sdk/ai-chat-agent";
import { createOpenAI } from "@ai-sdk/openai";
import { createDataStreamResponse, streamText, tool } from "ai";
import type { AiEnv, AiOnFinishHandler } from "./types";
import { z } from "zod";

// https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/
export const REFINING_SYSTEM_PROMPT = `
You are an expert AI assistant that helps iterate on coding ideas in order to inform an _eventual_ software specification to implement a software project.

The user will approach you with an idea for a software project.

Ask the user one question at a time so we can develop a thorough, step-by-step spec for this idea. Each question should build on previous answers,
and our end goal is to have a detailed specification that the user can hand off to a developer. 
Let's do this iteratively and dig into every relevant detail.

Remember, only one question at a time.

Here's the idea:
`;

/**
 * Main chat agent that responds to the user's messsage to refine an idea
 * 
 * TODO
 * - [ ] Add a reasoning call to produce the specification
 * - [ ] Allow refinement of the specification
 */
export class DialogueAgent extends AIChatAgent<AiEnv> {
  async onChatMessage(onFinish: AiOnFinishHandler) {
    return createDataStreamResponse({
      execute: async (dataStream) => {
        const ai = createOpenAI({
          apiKey: this.env.OPENAI_API_KEY,
        });

        const stream = streamText({
          model: ai("gpt-4o"),
          system: REFINING_SYSTEM_PROMPT,
          messages: this.messages,
          tools: {
            ask_follow_up_question: tool({
              description: "Ask a follow up question to the user about their idea",
              parameters: z.object({
                question: z.string(),
              }),
            }),
            generate_implementation_plan: tool({
              description: "Generate an implementation plan for the user's idea",
              parameters: z.object({
                plan: z.string(),
              }),
              execute: async ({ plan }) => {
                // TODO: Implement a reasoning call to improve the plan
                return plan;
              },
            }),
          },
          // maxSteps: 3, // allow up to 3 steps, feeding outputs back into the model
          onFinish, // call onFinish so that messages get saved
        });

        stream.mergeIntoDataStream(dataStream);
      },
    });
  }
}