---
title: Hono
description: An introduction to the engine that drives the HONC stack.
---

[Hono](https://hono.dev/docs/) is a blazing backend framework built on Web Standards. It has 0 dependencies, a minimal bundle size, and [super fast routing](https://hono.dev/docs/concepts/benchmarks), making it ideal for applications that require simplicity and performance.

Despite its small footprint, Hono offers a wide variety of tooling to meet common backend needs through either built-in or plug-in middleware. These include auth, rate limiting, and OpenAPI specs, to name a few.

Critically, it can be deployed on edge runtimes like Cloudflare workers. To accomplish this, Hono replaces the familiar `req` and `res` parameters with a unified [`Context`](https://hono.dev/docs/api/context) that consolidates values relevant across the request lifecycle.

## Context

Hono handlers take a single `Context` parameter, typically abbreviated `c`. It exposes the `Request` and `Response`, namely through a number of helper methods that can be used to access request data or format responses. The `c.req` property is an instance of `HonoRequest`, with helpers that expose request parameters or query data, as well as form and json payloads. To access the raw request, you must use `c.req.raw`. 

```typescript
import { Hono } from 'hono';

const app = new Hono()
  .get('/', async (c) => {
    return c.json({ message: 'HONC!' });
  });
```

## For more on Hono

- Read Hono creator Yusuke Wada's [story of how Hono came to be](https://blog.cloudflare.com/the-story-of-web-framework-hono-from-the-creator-of-hono/).
- Check out the [Hono GitHub repo](https://github.com/honojs).
- Join the [Hono Discord](https://discord.gg/KMh2eNSdxV).