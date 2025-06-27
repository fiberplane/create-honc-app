---
title: OpenAPI
description: Documenting API behavior.
sidebar:
  order: 3
---

Generating an [OpenAPI spec](https://swagger.io/specification/) is a fundamental requirement for most public APIs, and can be a valuable tool even for private backends. OpenAPI specs document APIs, making it easier for end-users to interact with them, and for larger teams to stay in sync.

A variety of tools exist to generate OpenAPI specs from validation schemas, but the [`hono-openapi`](https://hono.dev/examples/hono-openapi) middleware takes this a step further by integrating documentation directly into your app. While newer and less well-known than [Hono’s `zod-openapi` package](https://hono.dev/examples/zod-openapi), `hono-openapi` is much more flexible, and allows for incremental adoption.

Unlike `zod-openapi`, `hono-openapi` supports most validation libraries that have a Hono adapter. It also uses middleware instead of wrapping the `Hono` class, making it easier to add OpenAPI specs route by route, and avoiding breaking conflicts between Hono versions.

> Because `hono-openapi` uses middleware, handler responses are *not* type-checked. Users migrating from `zod-openapi` will find this disappointing, but it is a result of limitations in Hono’s type system, and cannot easily be addressed.
> 

## Implementation

Adding `hono-openapi` to an endpoint is a simple three-step process.

1. Create validation schemas for the relevant request and response data.
2. Use the `describeRoute` middleware to define endpoint specs.
3. Generate the (JSON) spec using the `openAPISpecs` handler.

### Creating OpenAPI-enhanced schemas

First, create schemas for request and response data using the library of your choice. If you’re using Zod or Valibot, you will need an additional dependency to extend the schemas with OpenAPI-specific metadata like examples or OpenAPI component references. For more information, please refer to the [`hono-openapi` installation guide](https://github.com/rhinobase/hono-openapi?tab=readme-ov-file#installation).

```tsx
import z from "zod";

// For extending the Zod schema with OpenAPI properties
import "zod-openapi/extend";

const ZUserByIdParam = z
  .object({
    id: z.string().uuid().openapi({ 
	    example: "3e0bb3d0-2074-4a1e-6263-d13dd10cb0cf",
    }),
  })
  .openapi({ ref: "UserByIdParam" });

const ZUserSelect = z
	.object({
		id: z.string().uuid().openapi({ 
	    example: "3e0bb3d0-2074-4a1e-6263-d13dd10cb0cf",
    }),
		name: z.string().openapi({
			example: "Goose McCloud",
		}),
		email: z.string().email().openapi({
			example: "gmccloud@honc.dev",
		}),
	})
	.openapi({ ref: "UserSelect" });
```

### Defining endpoint specs

Then, specify the response types for each endpoint using `describeRoute` and your response schema(s), paired with the `resolver` specific to the validation library you’re using. Request data types are read directly from the library-specific `validator` exported by `hono-openapi`, so there’s no need to duplicate them in the `describeRoute` definition.

```tsx
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";

const app = new Hono()
	.get(
	  "/",
	  describeRoute({
	    description: "Say hello to the user",
	    // validateResponse: true, // experimental
	    responses: {
	      200: {
	        description: "Successful greeting response",
	        content: {
	          "text/plain": {
	            schema: resolver(ZUserSelect),
	          },
	        },
	      },
	    },
	  }),
	  zodValidator("param", ZUserByIdParam),
	  (c) => {
	    const { id } = c.req.valid("param");
	    
	    const user = // ...
	    
	    return c.json(user);
	  },
	);
```

## Generating the OpenAPI spec

To generate the spec from your endpoint definitions, you need to add a dedicated endpoint that serves the `openAPISpecs` handler. This takes your Hono `app` instance, along with optional top-level information about your app. Note that these endpoints don’t need to be chained, as they don’t make use of Hono’s type inference.

```tsx
import { openAPISpecs } from "hono-openapi";

app.get(
  "/openapi",
  openAPISpecs(app, {
    documentation: {
      info: {
        title: "Hono",
        version: "1.0.0",
        description: "API for greeting users",
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Local server",
        },
      ],
    },
  })
);

```

### Creating documentation UI

You can also generate UI to visualize the generated OpenAPI spec using either [Hono’s `swagger-ui` handler](https://github.com/honojs/middleware/tree/main/packages/swagger-ui) or [Scalar’s Hono integration](https://github.com/scalar/scalar/tree/main/integrations/hono). These both take your `/openapi` endpoint as an argument, and render the returned JSON.

```tsx
import { swaggerUI } from "@hono/swagger-ui"

app.get(
  "/docs",
  swaggerUI({
    url: "/openapi",
  })
);
```