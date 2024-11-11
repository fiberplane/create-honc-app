import { instrument } from "@fiberplane/hono-otel";
import { neon } from "@neondatabase/serverless";
import { count } from "drizzle-orm";
import { type NeonHttpDatabase, drizzle } from "drizzle-orm/neon-http";
import { Hono } from "hono";
import { HomePage } from "./HomePage";
import { generateGooseJoke } from "./ai";
import { jokes } from "./db/schema";
// import { gooseJokesRateLimiter } from "./rate-limiter";
import type { Bindings } from "./types";

const app = new Hono<{ Bindings: Bindings }>();

// Add a rate limiter to the api since we're handing out all that free AI
// NOTE - Commented out due to 500 errors, the Key Value store is complaining about expiry time of certain keys
// app.use(gooseJokesRateLimiter);

app.get("/", async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  let joke: string;

  // 50/50 chance to either generate a new joke or get a random joke
  if (Math.random() < 0.5) {
    joke = await generateGooseJoke(db, c.env.AI);
    // Insert the new joke into the database
    await db.insert(jokes).values({ content: joke });
  } else {
    joke = await getRandomJoke(db, c.env.AI);
  }

  return c.html(<HomePage joke={joke} />);
});

/**
 * Retrieves all jokes from the database
 *
 * @param db - The drizzle neon wrapper
 * @returns A Promise that resolves to an array of jokes
 */
app.get("/api/jokes", async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  return c.json({
    jokes: await db.select().from(jokes),
  });
});

/**
 * Generates a new goose joke and inserts it into the database.
 *
 * You can quickly test joke generation and iterate the prompt while working in Fiberplane Studio.
 *
 * @param c - The Hono context
 * @returns A Promise that resolves to a JSON object containing the new joke
 */
app.post("/api/generate-joke", async (c) => {
  const ai = c.env.AI;
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  const joke = await generateGooseJoke(db, ai);

  if (!joke) {
    return c.json(
      {
        error: "No joke generated",
      },
      500,
    );
  }

  const [newJoke] = await db
    .insert(jokes)
    .values({
      content: joke,
    })
    .returning();

  return c.json({
    joke: newJoke,
  });
});

export default instrument(app);

/**
 * Retrieves a random joke from the database or generates a new one if there are fewer than 50 jokes.
 *
 * @param db - The database connection object
 * @param ai - The AI object used for generating new jokes
 * @returns A Promise that resolves to a string containing the joke
 */
async function getRandomJoke(db: NeonHttpDatabase, ai: Ai): Promise<string> {
  // Get the total count of jokes in the database
  const [{ count: jokeCount }] = await db
    .select({ count: count() })
    .from(jokes);

  // If there are fewer than 50 jokes, generate a new one instead
  if (jokeCount < 50) {
    return generateGooseJoke(db, ai);
  }

  // Generate a random offset to select a random joke
  const randomOffset = Math.floor(Math.random() * jokeCount);

  // Fetch a random joke using OFFSET
  const [randomJoke] = await db
    .select()
    .from(jokes)
    .limit(1)
    .offset(randomOffset);

  // Return the joke content or an empty string if no joke was found
  return randomJoke?.content ?? "";
}
