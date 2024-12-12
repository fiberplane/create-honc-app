import { css } from "hono/css";
import type { PropsWithChildren } from "hono/jsx";

type LayoutProps = { title: string } & PropsWithChildren;

export function Layout({ children, title }: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style id="hono-css" />
      </head>
      <body className={bodyClassName}>
        <main className={mainClassName}>{children}</main>
      </body>
    </html>
  );
}

const bodyClassName = css`
  display: flex;
  flex-direction: column;
  min-height: 100svh;
`;

const mainClassName = css`
  padding: 16px;
  flex: 1;
`;
