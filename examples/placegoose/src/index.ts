import { instrument } from "@fiberplane/hono-otel";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { raw } from "hono/html";
import { jsxRenderer } from "hono/jsx-renderer";
import { cloudflareRateLimiter } from "@hono-rate-limiter/cloudflare";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import Prism from "prismjs";

import Layout from "./components/Layout";
import homePage from "./pages/index.md";
import * as routes from "./routes";

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

const marked = new Marked(
  markedHighlight({
    emptyLangClass: "hljs",
    langPrefix: "hljs language-",
    highlight: (code) => {
      return Prism.highlight(
        code, 
        Prism.languages.javascript, 
        "javascript"
      );
    }
  })
);

app.get("/", jsxRenderer(Layout), (c) => {
  // todo: this seems off
  const content = marked.parse(homePage);
  return c.render(raw(content));
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
