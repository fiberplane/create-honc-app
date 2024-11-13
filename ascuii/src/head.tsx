import { Style, css } from "hono/css";

export function Head() {
  return (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <Style>{globalClassName}</Style>
    </>
  );
}

const globalClassName = css`
  :-hono-global {
    @font-face {
      font-family: Departure Mono;
      src: url('https://honcathon.honc-site.pages.dev/static/fonts/DepartureMono-Regular.woff2') format('woff2');
      font-weight: normal;
      font-style: normal;
    }

    :root {
      --background: #130900;
      --color: #fff;
      --foreground: #1c1612;
      --mid-background: #4c413b;
      --prime: #f15f29;
      --secondary: #37a0da;
      --font-mono: Departure Mono, monospace;
    }

    * {
      box-sizing: border-box;
      transition: all 0.2s;
    }

    html {
      font-family: var(--font-mono);
      background: var(--background);
      color: var(--color);
      margin: 0;
      padding: 0;
    }

    body {
      margin: 0;
      padding: 0;
    }

    a {
      color: var(--prime);
      text-decoration: none;
    }
  }
`;
