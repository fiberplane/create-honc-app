import { instrument } from "@fiberplane/hono-otel";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Hono } from "hono";
import { movieIdeas } from "./db/schema";
import Together from "together-ai";
// import { basicAuth } from 'hono/basic-auth'
import { streamText } from "hono/streaming";
import { HomePage } from "./Home";

type Bindings = {
  DATABASE_URL: string;
  TOGETHER_AI_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.html(<HomePage />);
});

// app.use(
//   '/*',
//   basicAuth({
//     username: 'santa',
//     password: 'hohoho',
//   })
// );

app.post("/api/together", async c => {
  const body = await c.req.json()
  const prompt = body.prompt || generateRandomDefaultPrompt()

  // Good to use this for cloudflare workers with wrangler, in order for stream-text to work
  c.header('Content-Encoding', 'Identity')

  const together = new Together({ apiKey: c.env.TOGETHER_AI_API_KEY });
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  let llmResponse = "";

  return streamText(c, async (stream) => {
    const response = await together.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
You are a helpful movie idea generator for Hallmark-like Christmas movies.
Don't greet the user or act like it's a conversation.
Just respond with titles in **title** format, followed by descriptions.
          `.trim()
        },
        {
          role: "user",
          content: `
          What should I write my next christmas movie about? Here was the outline of an idea I had: racoons
          `.trim()
        },
        {
          role: "assistant",
          content: `
**The Raccoon Who Saved Christmas**
When a mysterious raccoon in a Santa hat starts leaving small gifts and treats around town, a busy entrepreneur must team up with a handsome animal control officer to catch the masked bandit and discover the spirit of Christmas.
`.trim()
        },
        {
          role: "user",
          content: `What should I write my next christmas movie about? Here was the outline of an idea I had: ${prompt}`
        }
      ],
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      // TODO - File issue with Together - null is not a valid value for max_tokens
      // max_tokens: null,

      // We're going for randomness here. Santa help us.
      temperature: 0.9,
      top_p: 0.5,
      top_k: 90,
      repetition_penalty: 1,
      stop: ["<|eot_id|>", "<|eom_id|>"],
      stream: true
    });

    for await (const token of response) {
      const chunk = token.choices[0]?.delta?.content ?? ""
      llmResponse += chunk
      stream.write(chunk)
    }

    c.executionCtx.waitUntil(db.insert(movieIdeas).values({
      prompt,
      response: llmResponse
    }))
  });
});

app.get("/api/movie-ideas", async c => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  return c.json(await db.select().from(movieIdeas));
});

export default instrument(app);

/**
 * Generate a random default prompt for the movie idea generator
 */
function generateRandomDefaultPrompt() {
  const prompts = [
    "a toy maker and a cookie decorator",
    "a ski instructor and a hot cocoa shop owner",
    "a city girl and a small-town Christmas tree farmer",
    "a firefighter and a holiday candle maker",
    "a snow globe collector and a travel writer",
    "a reindeer rancher and a big city CEO",
    "a gingerbread architect and a candy cane factory worker",
    "a Christmas market vendor and a choir director",
    "a journalist and a mysterious secret Santa",
    "a clockmaker and a Christmas Eve time traveler",
    "a polar bear biologist and a toy inventor",
    "a snowplow driver and a holiday parade organizer",
    "a photographer and a Christmas lights competitor",
    "a novelist and a charming bookstore owner",
    "a party planner and a reluctant holiday Scrooge",
    "a caroler and a music producer",
    "a holiday innkeeper and a stranded traveler",
    "a sled dog trainer and a winter sports coach",
    "a town mayor and a wandering vagabond",
    "a weather reporter and a snowstorm chaser",
    "a secret royal and a tree decorating enthusiast",
    "a holiday historian and a magical Christmas artifact",
    "a chocolatier and a peppermint farmer",
    "a Santa impersonator and a toy store owner",
    "a holiday card designer and a mysterious pen pal",
    "a candle shop owner and a pyrotechnics expert",
    "a pastry chef and a Christmas cookie contest judge",
    "a sweater knitter and a fashion influencer",
    "a Christmas ornament crafter and an antique shop owner",
    "a dog walker and a holiday pet adoption coordinator",
    "a gardener and a poinsettia grower",
    "a mail carrier and a mysterious lost package",
    "a librarian and a magical Christmas book",
    "a Christmas tree delivery driver and a quirky inventor",
    "a snowflake scientist and a kindergarten teacher",
    "a fashion designer and a festive runway show host",
    "a musician and a silent night composer",
    "a theater director and a quirky holiday actor",
    "a chef and a Christmas dinner competition",
    "a detective and a stolen holiday spirit",
    "a candy shop owner and a grumpy landlord",
    "a retired soldier and a Christmas charity organizer",
    "a Christmas carnival operator and a big city architect",
    "a baker and a chocolatier rivalry",
    "a Santa's helper and a jaded mall elf",
    "a journalist and a mysterious North Pole insider",
    "a teacher and a holiday exchange student",
    "a veterinarian and a talking animal secret",
    "a fisherman and a coastal holiday festival",
    "a furniture maker and a legendary rocking chair"
  ];

  return prompts[Math.floor(Math.random() * prompts.length)]
}