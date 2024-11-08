import { css } from "hono/css";
import type { PropsWithChildren } from "hono/jsx";

type ProviderProps = PropsWithChildren;

export function Provider({ ...props }: ProviderProps) {
  return <div className={globalClass} {...props} />;
}

const globalClass = css`
  :-hono-global {
    @font-face {
      font-family: "Departure Mono";
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
    }

    * {
      box-sizing: border-box;
      transition: all 0.2s;
    }

    html {
      font-family: Departure Mono, monospace;
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
