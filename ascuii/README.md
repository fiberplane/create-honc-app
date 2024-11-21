# @fiberplane/ascuii

A minimal UI component library for Hono applications with an ASCII aesthetic.

These components are intended to work with `hono/jsx` out of the box, so you don't need a custom renderer outside of Hono to start using them.

## Installation

As of writing, this package is not published to npm. You can copy components into your project. At a minimum, you'll need to copy `src/head.tsx` into your project for styles and fonts to load correctly, as the `Head` component defines the necessary CSS variables.

## Setup

Always include the `Head` component in your HTML head to load required styles and fonts:

```tsx
import { Head } from "@fiberplane/ascuii";

app.get("/", (c) => {
  return c.html(
    <html>
      <head>
        <title>My App</title>
        <Head />
      </head>
      <body>
        {/* Your app content */}
      </body>
    </html>
  );
});
```

## Components

- `Button` - A styled button with hover effects
- `Card`, `CardHeader`, `CardContent`, `CardFooter`, `CardTitle`, `CardDescription` - Card layout components
- `Checkbox` - A custom styled checkbox input
- `Input` - A text input field with dashed borders
- `Label` - A form label component
- `RadioButton` - A custom styled radio input
- `Select`, `SelectOption` - Styled select dropdown components
- `Separator` - A dashed line separator (horizontal or vertical)
- `Slider` - A range input with custom styling
- `Switch` - A toggle switch component
- `TabsRoot`, `TabsList`, `TabsTrigger`, `TabsContent` - Tab navigation components

## Example

```tsx
import { Hono } from "hono";
import { Head, Card, CardTitle, CardContent, Button } from "@fiberplane/ascuii";

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
        <Card>
          <CardTitle>Welcome</CardTitle>
          <CardContent>
            <Button>Click me</Button>
          </CardContent>
        </Card>
      </body>
    </html>
  );
});

export default app;
```

## Theme

The library uses CSS variables for theming:

```css
:root {
  --background: #130900;
  --color: #fff;
  --foreground: #1c1612;
  --mid-background: #4c413b;
  --prime: #f15f29;
  --secondary: #37a0da;
  --font-mono: Departure Mono, monospace;
}
```

You can override these variables to customize the appearance.
