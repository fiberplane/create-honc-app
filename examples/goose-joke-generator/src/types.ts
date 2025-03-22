/**
 * Bindings for the Goose Joke Generator api.
 *
 * These are accessible on `c.env` in the Hono api handlers.
 */
export type Bindings = {
  DB: D1Database; // Cloudflare D1 binding, enabled in wrangler.toml
  AI: Ai; // Cloudflare AI binding, enabled in wrangler.toml
  GOOSE_JOKES_CACHE: KVNamespace; // Cloudflare KV binding, enabled in wrangler.toml
};
