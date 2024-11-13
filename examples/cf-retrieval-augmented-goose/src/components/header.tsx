import { Separator } from "@fiberplane/ascuii";
import { css } from "hono/css";

export function Header() {
  return (
    <header className={headerClassName}>
      <a href="/" className={primaryAnchorClassName}>
        🪿 Retrieval Augmented Goose
      </a>
      <Separator direction="vertical" />
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

const headerClassName = css`
  display: flex;
  gap: 8px;
  padding: 16px;
`;

const primaryAnchorClassName = css`
  margin-right: auto;
`;
