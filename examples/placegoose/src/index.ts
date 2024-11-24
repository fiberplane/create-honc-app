import { instrument } from "@fiberplane/hono-otel";
import { cloudflareRateLimiter } from "@hono-rate-limiter/cloudflare";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { raw } from "hono/html";
import { HTTPException } from "hono/http-exception";
import { jsxRenderer } from "hono/jsx-renderer";

import Layout from "./components/Layout";
import { mdToHtml } from "./lib/markdown";
import homePage from "./pages/index.md";
import * as routes from "./routes";

// Used to type Hono Context object, making bindings available
type AppType = {
  Variables: {
    rateLimit: boolean;
  };
  Bindings: {
    RATE_LIMITER: RateLimit;
  };
};

const app = new Hono<AppType>();

app.use("*", cors());

app.get("/", jsxRenderer(Layout), (c) => {
  // todo: this seems off
  const content = mdToHtml(homePage);
  return c.render(raw(content));
});

// https://www.npmjs.com/package/@hono-rate-limiter/cloudflare
app.use(
  cloudflareRateLimiter<AppType>({
    rateLimitBinding: (c) => c.env.RATE_LIMITER,
    keyGenerator: (c) => c.req.header("cf-connecting-ip") ?? "",
  }),
);

app.route("/gaggles", routes.gaggles);

app.route("/geese", routes.geese);

app.route("/honks", routes.honks);

app.onError((error, c) => {
  console.error(error);

  // Handle formatted errors thrown by app or hono
  if (error instanceof HTTPException) {
    return c.text(error.message, error.status);
  }

  return c.text("Something went wrong", 500);
});

export default instrument(app);
