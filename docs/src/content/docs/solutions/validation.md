---
title: Validation
description: Guarding against invalid requests with a type-safe boundary.
sidebar:
  order: 1
---

Most backends need some kind of validation (and parsing) layer. In the simplest case, this ensures that request data conforms to the expected type and shape, though it may also be used to format or transform data after it’s passed over the wire. Dates, for example, are converted to strings and must be rehydrated on the server.

In the world of TypeScript, a validation layer also creates a type-safe boundary around application logic. By guaranteeing that incoming values conform to the expected type, validators allow us to confidently work with request data, without polluting code with additional type checks. This is especially useful in the Hono ecosystem, where built-in type inference allows typed data to be passed seamlessly from middleware to handlers.

## Basic Validation

Hono takes a minimalist approach to validation, offering an implementation-agnostic [`validator` middleware](https://hono.dev/docs/guides/validation) that wraps validation logic and type-safely exposes valid results to the handler.

> Type inference only works if `validator` is applied directly to the method (as demonstrated below). The validation logic itself will be executed if called with `app.use`, but the handler won’t be aware of the validated types.
> 

The middleware takes two arguments: the validation `target`, and a `validationFunc` that returns the valid data or handles the error. The callback’s return type—excluding error responses—is then shared with the handler, which exposes the validation result through `c.req.valid("<target>")`. To validate multiple request targets (e.g., both `param` and `json`), simply chain them before the handler.

```tsx
import { HTTPException } from "hono/http-exception";
import { validator } from "hono/validator";

.post(
	"/users",
	validator("json", async (value, c) => {
		if (!data || typeof data !== "object") {
			// You can directly return an error response
      return c.text(400, "Invalid Payload");
    }
    
    const { email, name } = data;

    if (!email || typeof email !== "string") {
	    // Or throw an error to the `onError` handler 
	    // for additional processing
      throw new HTTPException(400, "Invalid Payload");
    }
    
    if (!name || typeof name !== "string") {
      throw new HTTPException(400, "Invalid Payload");
    }

    return { email, name };
	}),
	async (c) => {
		// { email: string; name: string; }
		const payload = c.req.valid("json");
	})
```

## Using a third-party validator

Of course, manually validating request data quickly becomes tedious and error-prone. In most cases, it’s preferable to use a third-party solution that allows you to define shareable (and composable) schemas.

Hono supports a variety of [third-party validators](https://hono.dev/docs/middleware/third-party#validators) through stand-alone middleware. These are essentially wrappers around `validator` with library-specific `validationFunc` implementations. Four of these are also compatible with Drizzle, making it easy to keep payload validation in sync with your database schema:

- [Zod](https://v3.zod.dev/)
- [Typebox](https://github.com/sinclairzx81/typebox)
- [Valibot](https://valibot.dev/)
- [Arktype](https://arktype.io/)

Since these third-party middleware implement `validationFunc` internally, their function signature is a bit different. In addition to the `target`, they require a validation `schema`, and accept an optional `hook` callback to customize error handling.

```tsx
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";

.post(
  "/users",
  zValidator("json", schema, (result, c) => {
		// Handle invalid data cases in the `hook`
    if (!result.success) {
      throw new HTTPException(400, "Invalid Payload");
    }
  })
  //...
)
```

In most cases, it is recommended to either create a wrapper around the validation middleware, or abstract the `hook`, in order to standardize error handling.

## Customizing `validator`

If you need to use an unsupported validation library, implement custom logic, or just avoid an additional dependency, it’s also quite simple to create your own `validator` wrapper. Doing so requires a more advanced understanding of TypeScript (and your validation library of choice), but the code itself is incredibly straightforward thanks to Hono’s accessible design patterns.

```tsx
import { validator } from 'hono/validator';

export const customZodValidator = <
  Target extends keyof ValidationTargets,
  Schema extends z.ZodSchema
>(target: Target, schema: Schema) => {

  return validator(target, async (value, c): Promise<z.output<Schema>> => {

    const result = await schema.safeParseAsync(value);
    
    if (!result.success) {
      return c.json({
        timestamp: Date.now(),
	      message: `invalid ${target}`,
	      issues: formatZodError(result.error.issues),
	    }, 400);
    }

    return result.data;
  });
};
```

For more information on `hono/validator` and how to customize it, [check out this blog post](https://dev.to/fiberplane/hacking-hono-the-ins-and-outs-of-validation-middleware-2jea) that walks through the `validator` typing and how it can be used to create custom solutions!