```jsx
import { Head, Button } from "@fiberplane/ascuii";
import { Hono } from "hono";

type Bindings = {};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.html(
    <html>
      <head>
        <title>My App</title>
        <Head />
      </head>
      <body>
        <Button>Hello Geese</Button>
      </body>
    </html>
  );
});

```
