
When you can, mount route handlers at the route definition,
instead of splitting out into its own function,
as this preserves the type inference that Hono gives us
```typescript
// Good:
app.get("/new-route", (c) => {
  const { env } = c;
  return c.json({ message: "Hello, World!" });
});

// Bad:
app.get("/new-route", newRoute);
function newRoute(c: Context) {
  const { env } = c;
  return c.json({ message: "Hello, World!" });
}
```

If you need to split the route handler out into its own function,
use the `createHandler` function from Hono to get proper type inference.
You need to have an `AppType` that defines the types of properties that the context object has.
```typescript
import { createHandler } from 'hono/factory'
import type { AppType } from './types'

/**
 * AppType should look like this:
 * 
 * type AppType = {
 *   Bindings: {
 *     NAME_OF_ENV_VARIABLE: string;
 *     // ...
 *   };
 *   Variables: {
 *     NAME_OF_CONTEXT_VARIABLE: number;
 *     // ...
 *   };
 * }
*/

const handler = createHandler<AppType>((c) => {
  const { env } = c;
  return c.json({ message: "Hello, World!" });
});



