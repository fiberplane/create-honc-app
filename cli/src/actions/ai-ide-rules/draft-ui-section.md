### UI and Styling
You must use `hono/jsx` which is a limited subset of jsx for server-side rendering in Hono.

Make sure the file has a `.tsx` extension if you use JSX.

If you update the `src/index.ts` file to be `src/index.tsx`, then you need to update the 

```tsx {file=src/HomePage.tsx}
import type { FC } from "hono/jsx";
import { html } from "hono/html";

export const HomePage: FC<{ joke: string }> = ({ joke }) => {
  return (
    <html lang="en">
      <head>
        <title>My App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🦢</text></svg>" />
        {html`
          <script>
            // No need to use dangerouslySetInnerHTML.
            // If you write it here, it will not be escaped.
          </script>
        `}
        {html`
          <style>
            body {
              background-color: #ffffcc;
              color: #333;
              text-align: center;
              padding: 50px;
            }
            @media (max-width: 600px) {
              body {
                padding: 10px;
              }
            }
            h1 {
              color: #ff6600;
              font-size: 36px;
              margin-bottom: 30px;
            }
            .button-container {
              margin-top: 20px;
            }
          </style>
        `}
        <style
          // biome-ignore lint/security/noDangerouslySetInnerHtml: we do not want quotes to be escaped
          dangerouslySetInnerHTML={{
            __html: `
        `,
          }}
        />
      </head>
      <body>
        <h1>🦢 Goose Joke Generator 🦢</h1>
        <div>
          <div class="button-container">
            <button class="refresh-btn" type="submit" onclick="location.reload()">
              Generate a joke
            </button>
          </div>
        </div>
      </body>
    </html>
  );
};
```