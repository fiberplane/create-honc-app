import { instrument } from "@fiberplane/hono-otel";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Hono } from "hono";
import { MetadataMode, storageContextFromDefaults, type NodeWithScore, VectorStoreIndex, Settings, OpenAIEmbedding, OpenAI } from "llamaindex";

import { PostgresIndexStore } from "llamaindex/storage/indexStore/PostgresIndexStore";
import { PostgresDocumentStore } from "llamaindex/storage/docStore/PostgresDocumentStore";
import { PGVectorStore } from "llamaindex/vector-store/PGVectorStore";
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
  // TODO - Easier way to add api keys
  //
  // https://ts.llamaindex.ai/docs/llamaindex/setup/cloudflare
  //

  Settings.embedModel = new OpenAIEmbedding({
    apiKey: c.env.OPENAI_API_KEY,
    model: "text-embedding-3-small",
  });

  Settings.llm = new OpenAI({
    apiKey: c.env.OPENAI_API_KEY,
    // model: "gpt-4o-mini",
  });

  // const query = c.req.query.query;
  const query = c.req.query("q") || "how do i use the d1 binding in a worker to query a database?";

  const clientConfig = {
    connectionString: c.env.DATABASE_URL,
  };

  const storageContext = await storageContextFromDefaults({
    docStore: new PostgresDocumentStore({
      clientConfig,
    }),
    indexStore: new PostgresIndexStore({
      clientConfig,
    }),
    vectorStore: new PGVectorStore({
      clientConfig,
    }),
  });

  const vectorIndex = await VectorStoreIndex.init({
    storageContext,
  });

  const response = await queryStore(vectorIndex, query);

  return c.json({ query, result: response ?? [] });
});


// app.get("/api/users", async (c) => {
//   const sql = neon(c.env.DATABASE_URL);
//   const db = drizzle(sql);

//   return c.json({
//     users: await db.select().from(users),
//   });
// });

export default instrument(app);


export async function queryStore(vectorIndex: VectorStoreIndex, query: string) {
  const queryEngine = vectorIndex.asQueryEngine();
  const { response, sourceNodes } = await queryEngine.query({
    query,
  });


  if (!sourceNodes) {
    return null;
  }

  const documents = sourceNodes.map((source: NodeWithScore) => {
    return {
      score: source.score,
      content: source.node.getContent(MetadataMode.NONE),
    };
  });

  return {
    documents,
    response
  }
}