import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

config({ path: './.dev.vars' })

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  }
})
