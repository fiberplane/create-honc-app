import { desc } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { jokes } from "./db/schema";

/**
 * Generates a new goose joke using AI
 *
 * @param db - The drizzle neon wrapper
 * @param ai - Cloudflare AI binding
 * @returns A Promise that resolves to a string containing the generated goose joke
 */
export async function generateGooseJoke(
  db: NeonHttpDatabase,
  ai: Ai,
): Promise<string> {
  // Fetch the 5 most recent jokes
  const recentJokes = await db
    .select()
    .from(jokes)
    .orderBy(desc(jokes.createdAt))
    .limit(5);

  const recentJokesContent = recentJokes.map((joke) => joke.content).join("\n");

  const systemPrompt = `
    You are an kitschy stand-up comedian.
    Craft a joke about a goose in the style of a 1970s Saturday Night Live skit or Jerry Seinfeld.
    The joke should be short and family-friendly.
    Bad puns are allowed.
    Do not end with "Say HONK" or "Said HONK!".

    Here is a good example:
    
    "Why did the goose cross the road? To prove he wasn't chicken! This is funny because geese are not chickens."

    Here are some recent jokes to avoid repeating:
    ${recentJokesContent}

    ALWAYS EXPLAIN THE JOKE AFTERWARDS. That's what makes it funny.
  `.trim();
  const userPrompt = `
    Generate me a funny joke about a goose.
    Do not repeat any of these recent jokes or puns:\n${recentJokesContent}
  `.trim();

  const response: AiTextGenerationOutput = await ai.run(
    "@cf/meta/llama-3.1-8b-instruct-fast" as BaseAiTextGenerationModels,
    {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.72,
    },
  );

  let joke = "";
  if (response instanceof ReadableStream) {
    const textStream = response.pipeThrough(new TextDecoderStream());
    const text = await textStream.getReader().read();
    joke = text.value ?? "";
  } else {
    joke = response.response ?? "";
  }

  return joke;
}
