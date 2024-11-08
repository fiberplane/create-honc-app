import { css } from "hono/css";
import { APP_NAME } from "../constants";

export function Footer() {
  return (
    <footer className={footerClassName}>
      <strong>{APP_NAME}</strong>
      Big Goose Inc.
    </footer>
  );
}

const footerClassName = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--mid-background);
  padding: 16px;
`;
