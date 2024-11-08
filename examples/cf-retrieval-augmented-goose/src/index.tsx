import { instrument } from "@fiberplane/hono-otel";
import { neon } from "@neondatabase/serverless";
import { cosineDistance, sql as magicSql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { Hono } from "hono";
import { OpenAI } from "openai";
import { Layout } from "./components/layout";
import { chunks, documents } from "./db/schema";
import { SearchForm } from "./components/search-form";
import { SearchResults } from "./components/search-results";
import { APP_NAME } from "./constants";

type Bindings = {
  DATABASE_URL: string;
  OPENAI_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.html(
    <Layout title={APP_NAME}>
      <SearchForm />
    </Layout>,
  );
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
    return c.html(
      <Layout title={`Search results | ${APP_NAME}`}>
        <SearchForm similarity={similarityCutoff} />
        No search query provided
      </Layout>,
      422,
    );
  }

  // Create embedding for the search query
  const openai = new OpenAI({
    apiKey: c.env.OPENAI_API_KEY,
    fetch: globalThis.fetch,
  });
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

  return c.html(
    <Layout title={`Search results | ${APP_NAME}`}>
      <SearchForm query={query} similarity={similarityCutoff} />
      <SearchResults
        results={
          // results,
          [
            {
              id: "1234",
              text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
              similarity: 0.2,
            },
            {
              id: "1234",
              text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
              similarity: 0.2,
            },
            {
              id: "1234",
              text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
              similarity: 0.2,
            },
            {
              id: "1234",
              text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
              similarity: 0.2,
            },
            {
              id: "1234",
              text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
              similarity: 0.2,
            },
            {
              id: "1234",
              text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
              similarity: 0.2,
            },
          ]
        }
      />
    </Layout>,
  );
});

export default instrument(app);
