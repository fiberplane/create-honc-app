import { css } from "hono/css";
import type { PropsWithChildren } from "hono/jsx";

type ButtonProps = PropsWithChildren;

export function Button({ ...props }: ButtonProps) {
  return <button className={buttonClassName} {...props} />;
}

const buttonClassName = css`
  width: 100%;
  text-align: center;
  font-family: Departure Mono, monospace;
  padding: 8px 16px;
  background: var(--prime);
  color: var(--background);
  box-shadow: 4px 4px 0 var(--mid-background);
  border: none;

  &:hover {
    background: var(--color);
    color: black;
    cursor: pointer;
    box-shadow: 0 0 var(--foreground);
  }
`;
