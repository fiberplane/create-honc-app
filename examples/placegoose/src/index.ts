import { instrument } from "@fiberplane/hono-otel";
import { cloudflareRateLimiter } from "@hono-rate-limiter/cloudflare";
import { Hono } from "hono";
import { getConnInfo } from "hono/cloudflare-workers";
import { cors } from "hono/cors";
import { raw } from "hono/html";
import { HTTPException } from "hono/http-exception";
import { jsxRenderer } from "hono/jsx-renderer";
import { createFiberplane } from "@fiberplane/hono";

import Layout from "./components/Layout";
import { mdToHtml } from "./lib/markdown";
import { formatZodError, isZodError } from "./lib/validation";
import homePage from "./pages/index.md";
import * as routes from "./routes";
import type { AppType } from "./types";
import { apiSpec } from "./api-spec";

const app = new Hono<AppType>();

app.use("*", cors());

/**
 * The jsxRenderer middleware pipes the HTML returned
 * by c.render into a custom layout component
 */
app.get("/", jsxRenderer(Layout), (c) => {
  const content = mdToHtml(homePage);
  return c.render(raw(content));
});

/**
 * Limit how often users can make a request, based on the
 * configurations set in wrangler.toml
 * In a production context, using a unique user identifier is
 * preferred, as IP addresses can be shared between users.
 * @see https://github.com/rhinobase/hono-rate-limiter/tree/main/packages/cloudflare#usage
 */
app.use(
  cloudflareRateLimiter<AppType>({
    rateLimitBinding: (c) => c.env.RATE_LIMITER,
    keyGenerator: (c) => {
      if (c.env.ENVIRONMENT === "production") {
        // Use Hono helper to get request IP (v4 or v6)
        return getConnInfo(c).remote.address ?? "";
      }

      return "localhost";
    },
  }),
);

app.route("/gaggles", routes.gaggles);

app.route("/geese", routes.geese);

app.route("/honks", routes.honks);

// Mount the Fiberplane playground to play with the API
app.use("/fp/*", createFiberplane({
  openapi: { content: JSON.stringify(apiSpec) },
  debug: true,
  // authTraces: false,
}));

app.onError((error, c) => {
  console.error(error);

  // Handle formatted errors thrown by app or hono
  if (error instanceof HTTPException) {
    let issues: Record<string, string[]> | undefined = undefined;
    if (error.cause instanceof Error && isZodError(error.cause)) {
      issues = formatZodError(error.cause);
    }

    return c.json(
      {
        message: error.message,
        ...(issues && { issues }),
      },
      error.status,
    );
  }

  return c.json(
    {
      message: "Something went wrong",
    },
    500,
  );
});

export default instrument(app);
