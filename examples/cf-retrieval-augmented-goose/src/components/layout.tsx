import { css } from "hono/css";
import type { PropsWithChildren } from "hono/jsx";
import { Head } from "../ascuii/head";
import { Footer } from "./footer";
import { Header } from "./header";

type LayoutProps = PropsWithChildren<{ title: string }>;

export function Layout({ children, title }: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <title>{title}</title>
        <Head />
      </head>
      <body className={bodyClassName}>
        <Header />
        <main className={mainClassName}>{children}</main>
        <Footer />
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
