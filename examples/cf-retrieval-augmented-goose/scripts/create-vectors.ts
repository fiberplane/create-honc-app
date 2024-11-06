import fs from 'node:fs';
import { generateObject, embedMany } from "ai";
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { documents, chunks } from "../src/db/schema";
import crypto from 'node:crypto';

config({ path: "./.dev.vars" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set - check .dev.vars file");
}

// Constants to help with accessing files of built docs
const CF_DOCS_DIR_PREFIX = "/Users/brettbeutell/fiber/create-honc-app/examples/cf-retrieval-augmented-goose/data";
const DOCS_FILES = getPaths();

// Define schemas for structured output
const BaseChunkSchema = z.object({
  title: z.string().describe('Title of the content chunk.'),
  content: z.string().describe('Main content of the chunk, with code samples in Markdown.'),
  tags: z.array(z.string()).describe('Array of metadata tags for the chunk.'),
  // tags: z.array(z.enum(['workers', 'r2', 'd1', 'ai', 'queues', 'hono'])).describe('Array of metadata tags for the chunk.'),
});
type BaseChunk = z.infer<typeof BaseChunkSchema>;
const DocumentSchema = z.object({
  title: z.string().describe('Title of the document.'),
  chunks: z.array(BaseChunkSchema).describe('Array of content chunks.'),
});

const VectorizedChunkSchema = BaseChunkSchema.extend({
  embedding: z.array(z.number()).describe('Embedding vector for the chunk.'),
});

type VectorizedChunk = z.infer<typeof VectorizedChunkSchema>;

// Initialize database connection
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

// /=== MAIN ===\ //
for (const path of DOCS_FILES.slice(0, 1)) {
  const doc = await processDoc(path);
  await saveToDatabase(doc);
  console.log(`Processed and saved: ${path}`);
}
// \=== MAIN ===/ //


async function processDoc(path: string) {
  const SYSTEM_PROMPT = `
You are a data cleaner specializing in HTML content extraction.

Your task is to process HTML documents and extract the main content by performing the following steps:

- Remove common sidebars, footers, and navigation elements.
- Retain the primary content.
- Split the content into logical chunks, allowing for some overlap between chunks.
- Convert code samples to Markdown format in the appropriate programming languages.
- Determine metadata tags for each chunk

Please process the given HTML document accordingly.
`.trim()
  const docsPath = path.split("cloudflare-docs/dist")[1];
  // Read the HTML file content
  const content = fs.readFileSync(path, 'utf-8');

  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: DocumentSchema,
    system: SYSTEM_PROMPT,
    prompt: content,
  });

  const chunks = await processChunks(object.chunks);

  return {
    ...object,
    url: docsPath,
    chunks,
  }
}

async function processChunks(chunks: Array<BaseChunk>) {
  const { embeddings } = await embedMany({
    model: openai.embedding('text-embedding-3-small'),
    values: chunks.map((chunk) => chunk.content),
  });

  const result = chunks.map((chunk, index) => ({
    ...chunk,
    embedding: embeddings[index],
  }));

  return result;
}

// Add new function to handle database operations
async function saveToDatabase(doc: { url: string, title: string, chunks: Array<VectorizedChunk> }) {
  const documentHash = crypto.createHash('md5').update(doc.url).digest('hex');
  
  // Insert document
  const [savedDoc] = await db.insert(documents).values({
    title: doc.title, // Using first chunk's title as document title
    url: doc.url,
    content: doc.chunks.map(c => c.content).join('\n'),
    hash: documentHash,
  }).returning();

  // Insert chunks
  await db.insert(chunks).values(
    doc.chunks.map((chunk, index) => ({
      documentId: savedDoc.id,
      chunkNumber: index,
      text: chunk.content,
      embedding: chunk.embedding,
      metadata: chunk.tags,
      hash: crypto.createHash('md5').update(chunk.content).digest('hex'),
    }))
  );
}

function getPaths() {
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
  ].map((path) => `${CF_DOCS_DIR_PREFIX}/${path}`).filter((path) => path.endsWith(".html"));

  return WORKERS_FILES_THAT_MENTION_HONO;
}