import { css } from "hono/css";

const headerClassName = css`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 16px;
`;

export function Header() {
  return (
    <header className={headerClassName}>
      <a href="/">🪿 Retrieval Augmented Goose</a>
      <a
        href="https://github.com/fiberplane/create-honc-app/tree/main/examples/cf-retrieval-augmented-goose"
        target="_blank"
        rel="noreferrer"
      >
        GitHub
      </a>
    </header>
  );
}
