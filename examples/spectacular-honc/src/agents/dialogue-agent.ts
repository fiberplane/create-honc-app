import { AIChatAgent } from "agents-sdk/ai-chat-agent";

import { createOpenAI } from "@ai-sdk/openai";
import { createDataStreamResponse, streamText, tool } from "ai";
import { drizzle } from "drizzle-orm/d1";
import type { AiEnv, AiOnFinishHandler } from "./types";
import { z } from "zod";
import { specifications, type Specification } from "@/db/schema";
import type { AgentContext, Connection, WSMessage } from "agents-sdk";
import { eq } from "drizzle-orm";

/**
 * Main chat agent that responds to the user's messsage to refine an idea
 * 
 * TODO
 * - [ ] Add a reasoning call to produce the specification
 * - [ ] Allow refinement of the specification
 */
export class DialogueAgent extends AIChatAgent<AiEnv> {
  specifications: Pick<Specification, "id">[];
  constructor(ctx: AgentContext, env: AiEnv) {
    super(ctx, env);
    this.sql`create table if not exists cf_ai_chat_agent_specifications (
      id text primary key
    )`;
    this.specifications = (
      this.sql`select * from cf_ai_chat_agent_specifications` || []
    ).map((row) => {
      return { id: Number.parseInt(row?.id as string) };
    });
  }

  /**
   * Method that saves a spec
   * 
   * We only save the latest spec id
   */
  private async persistSpecification(
    specification: Pick<Specification, "id">
  ) {
    this.sql`delete from cf_ai_chat_agent_specifications`;
    this.sql`insert into cf_ai_chat_agent_specifications (id) values (${specification.id?.toString?.()})`;
    this.specifications = [specification];
  }

  private async clearSpecifications() {
    this.sql`delete from cf_ai_chat_agent_specifications`;
    this.specifications = [];
  }

  /**
   * HACK - Clear the specification from agent memory when the chat is cleared
   */
  async onMessage(connection: Connection, message: WSMessage): Promise<void> {
    // Log incoming messages for debugging
    console.log("Received message:", message);

    if (typeof message === "string") {
      const data = JSON.parse(message) as { type: string };
      if (data.type === "cf_agent_chat_clear") {
        await this.clearSpecifications();
      }
    }

    // Delegate to parent class implementation
    super.onMessage(connection, message);
  }

  /**
   * Method that handles the chat message
   */
  async onChatMessage(onFinish: AiOnFinishHandler) {
    return createDataStreamResponse({
      execute: async (dataStream) => {
        const db = drizzle(this.env.DB);
        const ai = createOpenAI({
          apiKey: this.env.OPENAI_API_KEY,
        });

        const stream = streamText({
          model: ai("gpt-4o"),
          system: createSystemPrompt(this.specifications[0]?.id),
          messages: this.messages,
          tools: {
            generate_implementation_plan: tool({
              description: "Generate an implementation plan for the user's idea",
              parameters: z.object({
                title: z.string().describe("The title of the specification"),
                plan: z.string().describe("A handover document for a developer to implement the specification"),
              }),
              execute: async ({ title, plan }) => {
                console.log("Executing generate_implementation_plan tool");
                // TODO: Implement a reasoning call to improve the plan
                const [spec] = await db.insert(specifications).values({
                  title: title,
                  content: plan,
                  version: 1,
                }).returning();
                await this.persistSpecification(spec);
                return plan;
              },
            }),
            update_specification: tool({
              description: "Update the specification",
              parameters: z.object({
                id: z.number().describe("The id of the specification"),
                title: z.string().describe("The title of the specification"),
                plan: z.string().describe("A handover document for a developer to implement the specification"),
              }),
              execute: async ({ title, plan, id }) => {
                console.log("Executing update_specification tool");
                // TODO: Implement a reasoning call to improve the plan
                const [spec] = await db.update(specifications).set({
                  title: title,
                  content: plan,
                  // version: 1,
                }).where(eq(specifications.id, id)).returning();
                await this.persistSpecification(spec);
                return plan;
              },
            }),
          },
          onStepFinish: (step) => {
            console.log("Step finished:", step);
            
            // this.messages.push(step);
            // ...
          },
          // maxSteps: 3, // allow up to 3 steps, feeding outputs back into the model
          onFinish, // call onFinish so that messages get saved
        });

        stream.mergeIntoDataStream(dataStream);
      },
    });
  }
}

/**
 * System prompt for the dialogue agent
 * 
 * Inspired by https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/
 */
function createSystemPrompt(specId?: number) {
  const REFINING_SYSTEM_PROMPT = `
You are an expert AI assistant that helps iterate on coding ideas in order to inform an _eventual_ software specification to implement a software project.

The user will approach you with an idea for a software project.

Ask the user one question at a time so we can develop a thorough, step-by-step spec for this idea. Each question should build on previous answers,
and our end goal is to have a detailed specification that the user can hand off to a developer. 
Let's do this iteratively and dig into every relevant detail.

Remember, only one question at a time.
`;

  if (specId) {
    return `${REFINING_SYSTEM_PROMPT}\n\nIf you need to refine the specification, use the following id your update tool call: ${specId}`;
  }

  return REFINING_SYSTEM_PROMPT;
}