/**
 * Bindings for the Goose Joke Generator api.
 *
 * These are accessible on `c.env` in the Hono api handlers.
 */
export type Bindings = {
  DATABASE_URL: string;
  AI: Ai; // Cloudflare AI binding, enabled in wrangler.toml
  GOOSE_JOKES_CACHE: KVNamespace; // Cloudflare KV binding, enabled in wrangler.toml
};
