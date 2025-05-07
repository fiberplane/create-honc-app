---
title: Hono
description: An introduction to the engine that drives the HONC stack.
---

[Hono](https://hono.dev/docs/) is a blazing backend framework built on Web Standards. It has 0 dependencies, a minimal bundle size, and [super fast routing](https://hono.dev/docs/concepts/benchmarks), making it ideal for applications that require simplicity and performance.

Despite its small footprint, Hono offers a wide variety of tooling to meet common backend needs through either built-in or plug-in middleware. These include auth, rate limiting, and OpenAPI specs, to name a few.

Critically, it can be deployed on edge runtimes like Cloudflare workers. To accomplish this, Hono replaces the familiar `req` and `res` parameters with a unified [`Context`](https://hono.dev/docs/api/context) that consolidates values relevant across the request lifecycle.

```typescript
import { Hono } from "hono";

const app = new Hono()
  .get("/search", async (c) => {
    const search = c.req.query("search");
    return c.json({ search });
  });
```

## Context

Hono handlers take a single `Context` parameter, typically abbreviated `c`. It exposes the `Request` and `Response`. The `c.req` property is an instance of `HonoRequest`, with methods that expose typed request parameters or query data, as well as form and json payloads. To access the raw `Request`, you must use `c.req.raw`. Default text, JSON, and HTML responses can then be generated using `Context` methods of the same name, though a custom `Response` can be returned if additional configuration is necessary.

> Note: To parse or validate request data, use Hono's `validator` middleware. Valid data is then type-safely available via `c.req.valid`. Integrations are available for a number of popular TypeScript validation tools.

The `Context` object also exposes environment variables, Cloudflare bindings, and any key/value pairs `set` in middleware, all of which are created for each request. Environment variables and bindings are available on `c.env`, while custom values can be accessed through `c.var` or the `c.get` method.

### Typing

To get the most out of Hono's type-safety, it's recommended to chain methods, and to implement handlers inline rather than abstracting them. Hono uses inference to share the `Context` type with handlers—including mutations performed in middleware, so these types are only available on chained downstream handlers. Chaining is also required when using Hono's testing or RPC client to make type-safe requests to the app.

> Note: Chaining isn't necessary for methods that don't rely on global or middleware-set values and don't need to be available to Hono's testing or RPC clients (e.g., an endpoint serving the `openapi` spec).

Global types (e.g., Cloudflare bindings), or those of variables set in `Context`, can be specified as a generic parameter when creating a new `Hono` instance. They will then be available in any handlers attached directly to the instance, or any middleware written inline.

```typescript
type AppEnv = {
  // Environment variables and Cloudflare bindings set here
  Bindings: { 
    DB: D1Database;
    ENVIRONMENT: "development" | "staging" | "production";
  };
  // This is for variables `set` in middleware
  Variables: { 
    db: DrizzleD1Database 
  };
};

const app = new Hono<AppEnv>()
  .get("/", async (c) => {
    const environment = c.env.ENVIRONMENT;

    const db = c.var.db;
    // or c.get("db")

    // ...
  });
```

Notice that in the above example, TypeScript allows `c.var.db` even though that key hasn't been `set` in the middleware chain, and the call will fail at runtime. This illustrates a key trade-off that Hono makes between developer experience and type-safety (in the strictest sense). Hono's type system is "optimistic"—it assumes generic types are kept in sync with code—requiring a heightened level of developer discipline.

To better couple `Context` typing with implementations, Hono offers a suite of factory helpers that can be used to abstract middleware and handlers, or to bind middleware directly to typed Hono instances. This effectively narrows the scope of Hono's "optimism", mitigating some of the pitfalls associated with decoupled typing. Since inferred `Context` typing is only available to inline middleware and handlers, factory helpers are also used to make global types available in abstracted middleware or handlers, and to share types between middleware.

```typescript
const initDb = createMiddleware<{
  // Make middleware aware of global types
  Bindings: { DB: D1Database };
  // Share values set in middleware with downstream handlers
  Variables: { db: DrizzleD1Database };
}>(
  async (c, next) => {
    const db = drizzle(c.env.DB);
    c.set("db", db);
    await next();
  }
);

const initLogger = createMiddleware<{
  Variables: {
    // Include values set in other middleware, if needed
    db: DrizzleD1Database;
    // Add new key/value pair
    logger: CustomLogger;
  };
}>(
  async (c, next) => {
    /** */
  }
);

const app = new Hono()
  .use("*", initDb)
  .use("*", initLogger)
  .get("/", async (c) => {
    // Both variables available in `c.var`
    const { db, logger } = c.var;

    // ...
  });
```

## For more on Hono

- Read Hono creator Yusuke Wada's [story of how Hono came to be](https://blog.cloudflare.com/the-story-of-web-framework-hono-from-the-creator-of-hono/).
- Check out the [Hono GitHub repo](https://github.com/honojs).
- Join the [Hono Discord](https://discord.gg/KMh2eNSdxV).