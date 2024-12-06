import { css, cx } from "hono/css";
import type { JSX } from "hono/jsx";

type ButtonProps = JSX.IntrinsicElements["button"];

export function Button({ className, ...props }: ButtonProps) {
  return <button className={cx(buttonClassName, className)} {...props} />;
}

const buttonClassName = css`
  width: 100%;
  text-align: center;
  font-family: var(--font-mono);
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
