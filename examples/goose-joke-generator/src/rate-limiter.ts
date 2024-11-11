import { WorkersKVStore } from "@hono-rate-limiter/cloudflare";
import type { Context, Next } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { createFactory } from "hono/factory";
import type { Bindings } from "./types";

const factory = createFactory<{ Bindings: Bindings }>();

/**
 * Rate limiter for the Goose Jokes API.
 *
 * Limits each IP to 200 requests per 2 minutes.
 */
export const gooseJokesRateLimiter = factory.createMiddleware(
  (c: Context, next: Next) =>
    rateLimiter({
      windowMs: 2 * 60 * 1000, // 2 minutes
      limit: 3000, // Limit each IP to 3000 requests per `window` (here, per 2 minutes).
      standardHeaders: "draft-6", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
      keyGenerator: (c) => c.req.header("cf-connecting-ip") ?? "", // Method to generate custom identifiers for clients.
      store: new WorkersKVStore({
        // Here GOOSE_JOKES_CACHE is the Workers KV binding.
        namespace: c.env.GOOSE_JOKES_CACHE,
        // NOTE - You can add a prefix to the key to avoid conflicts with rate limiters for other routes
        // prefix: "goose-jokes-rate-limiter",
      }),
    })(c, next),
);
