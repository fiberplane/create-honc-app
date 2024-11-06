import {
  type Document,
  VectorStoreIndex,
  PostgresDocumentStore,
  PostgresIndexStore,
  storageContextFromDefaults,
  PGVectorStore,
  SimpleDirectoryReader,
  // FileReader,
  HTMLReader,
  Settings,
  OpenAI,
  OpenAIEmbedding,
} from "llamaindex";

import { config } from "dotenv";

config({ path: "./.dev.vars" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set - check .dev.vars file");
}

Settings.embedModel = new OpenAIEmbedding({
  // apiKey: c.env.OPENAI_API_KEY,
  model: "text-embedding-3-small",
});

Settings.llm = new OpenAI({
  // apiKey: c.env.OPENAI_API_KEY,
  // model: "gpt-4o-mini",
});

const clientConfig = {
  connectionString: process.env.DATABASE_URL,
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

// /Users/brettbeutell/fiber/create-honc-app/examples/cf-retrieval-augmented-goose/data/cloudflare-docs/dist/workers/databases/d1/index.html

// NOTE - Only has one index.html file
// NOTE - The compiled stuff is... not great for RAG. I think I'd wanna crawl the site
const D1_DIR =
  "/Users/brettbeutell/fiber/create-honc-app/examples/cf-retrieval-augmented-goose/data/cloudflare-docs/dist/workers/databases/d1";

const DIR_PREFIX = "/Users/brettbeutell/fiber/create-honc-app/examples/cf-retrieval-augmented-goose/data";

const WORKERS_FILES_THAT_MENTION_HONO = [
  "./cloudflare-docs/dist/d1/examples/query-d1-from-python-workers/index.html",
  "./cloudflare-docs/dist/workers-ai/static/documentation/notebooks/cloudflare-workers-ai.ipynb",
  "./cloudflare-docs/dist/workers-ai/tutorials/index.html",
  "./cloudflare-docs/dist/workers-ai/tutorials/build-a-retrieval-augmented-generation-ai/index.html",
  "./cloudflare-docs/dist/workers-ai/tutorials/explore-workers-ai-models-using-a-jupyter-notebook/index.html",
  "./cloudflare-docs/dist/workers-ai/demos/index.html",
  "./cloudflare-docs/dist/workers-ai-notebooks/cloudflare-workers-ai.ipynb",
  "./cloudflare-docs/dist/workers/configuration/compatibility-dates/index.html",
  "./cloudflare-docs/dist/workers/platform/changelog/index.html",
  "./cloudflare-docs/dist/workers/platform/changelog/index.xml",
  "./cloudflare-docs/dist/workers/platform/changelog/platform/index.xml",
  "./cloudflare-docs/dist/workers/platform/changelog/historical-changelog/index.html",
  "./cloudflare-docs/dist/workers/platform/compatibility-dates.json",
  "./cloudflare-docs/dist/workers/runtime-apis/cache/index.html",
  "./cloudflare-docs/dist/workers/runtime-apis/bindings/rate-limit/index.html",
  "./cloudflare-docs/dist/workers/tutorials/build-a-slackbot/index.html",
  "./cloudflare-docs/dist/workers/tutorials/index.html",
  "./cloudflare-docs/dist/workers/tutorials/store-data-with-fauna/index.html",
  "./cloudflare-docs/dist/workers/tutorials/create-finetuned-chatgpt-ai-models-with-r2/index.html",
  "./cloudflare-docs/dist/learning-paths/workers/get-started/first-application/index.html",
  "./cloudflare-docs/dist/pages/migrations/migrating-from-workers/index.html",
  "./cloudflare-docs/dist/r2/api/workers/workers-api-reference/index.html",
  "./cloudflare-docs/dist/r2/api/workers/workers-multipart-usage/index.html",
].map((path) => `${DIR_PREFIX}/${path}`).filter((path) => path.endsWith(".html"));

console.log(WORKERS_FILES_THAT_MENTION_HONO);

// const reader = new SimpleDirectoryReader();
// const documents = await reader.loadData(D1_DIR);

const documents: Document[] = [];

for (const path of WORKERS_FILES_THAT_MENTION_HONO.slice(0, 2)) {
  const reader = new HTMLReader();
  const docs = await reader.loadData(path);
  documents.push(...docs);
}

console.log(documents);

// const document = new Document({ text: "Test Text" });
const index = await VectorStoreIndex.fromDocuments(documents, {
  storageContext,
});

console.log("success");

process.exit(0);
