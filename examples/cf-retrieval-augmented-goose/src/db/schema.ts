import { sql } from 'drizzle-orm';
import { jsonb, pgTable, serial, text, timestamp, vector } from 'drizzle-orm/pg-core';

// TODO: Embedding Storage: If you're storing embeddings, ensure that your schema includes a column for embeddings, such as a vector type.
// TODO Indexing: Depending on your query patterns, consider adding indexes to the key and namespace columns to improve query performance.

export const chunks = pgTable('chunks', {
  id: serial('id').primaryKey(),
  key: text('key').notNull(),
  namespace: text('namespace').notNull(),
  value: jsonb('value').notNull(),
  // Use the drizzle `vector` helper to define an `embedding` column
  // The vectors we receive from OpenAI have length 1536
  embedding: vector('embedding', { dimensions: 1536 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    // TODO - Evaluate this
    .$onUpdate(() => sql`now()`),
});

