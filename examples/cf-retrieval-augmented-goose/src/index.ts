import { instrument } from "@fiberplane/hono-otel";
import { neon } from "@neondatabase/serverless";
import { cosineDistance, sql as magicSql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { Hono } from "hono";
import { OpenAI } from "openai";
import { chunks, documents } from "./db/schema";

type Bindings = {
  DATABASE_URL: string;
  OPENAI_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Honc! 🪿");
});

app.get("/documents", async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  return c.json({
    documents: await db.select().from(documents),
  });
});

app.get("/chunks", async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  return c.json({
    chunks: await db.select().from(chunks),
  });
});

app.get("/search", async (c) => {
  // Set up the orm
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  // Parse query parameters
  const query = c.req.query("query");
  const similarityCutoffStr = c.req.query("similarity");
  const similarityCutoff =
    Number.parseFloat(similarityCutoffStr || "0.5") ?? 0.5;

  if (!query) {
    return c.text("No search query provided", 422);
  }

  // Create embedding for the search query
  const openai = new OpenAI({ apiKey: c.env.OPENAI_API_KEY });
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });
  const queryEmbedding = embedding.data[0].embedding;

  // Craft a similarity search based on the cosine distance between:
  // - the embedding of the user's query, and
  // - the embedding of each recipe
  const similarityQuery = magicSql<number>`1 - (${cosineDistance(chunks.embedding, queryEmbedding)})`;

  // Search for chunks with similarity above cutoff
  const results = await db
    .select({
      id: chunks.id,
      text: chunks.text,
      similarity: similarityQuery,
    })
    .from(chunks)
    .where(magicSql`${similarityQuery} > ${similarityCutoff}`)
    .orderBy(magicSql`${similarityQuery} desc`)
    .limit(10);

  return c.json({ results });
});

export default instrument(app);
