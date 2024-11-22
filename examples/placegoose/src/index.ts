import { instrument } from "@fiberplane/hono-otel";
import { cloudflareRateLimiter } from "@hono-rate-limiter/cloudflare";
import { Hono } from "hono";
import { cors } from 'hono/cors'
import { HTTPException } from "hono/http-exception";
import { marked } from "marked";

import * as routes from "./routes";
import homePage from "./pages/index.md";

type AppType = {
  Variables: {
    rateLimit: boolean;
  };
  Bindings: {
    RATE_LIMITER: RateLimit;
  };
};

const app = new Hono<AppType>();

app.use("/", cors());

app.get("/", (c) => {
    const html = marked(homePage);
    return c.render(html);
});

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

  if (error instanceof HTTPException) {
    return c.text(error.message, error.status);
  }

  return c.text("Something went wrong", 500);
});

export default instrument(app);
