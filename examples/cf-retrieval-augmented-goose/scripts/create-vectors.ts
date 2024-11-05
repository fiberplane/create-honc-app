import {
  Document,
  VectorStoreIndex,
  PostgresDocumentStore,
  PostgresIndexStore,
  storageContextFromDefaults,
  PGVectorStore,
} from "llamaindex";

import { config } from "dotenv";

config({ path: "./.dev.vars" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set - check .dev.vars file");
}

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

const document = new Document({ text: "Test Text" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});

console.log("success");

process.exit(0);
