import { css, cx } from "hono/css";
import type { JSX } from "hono/jsx";

type InputProps = Exclude<
  JSX.IntrinsicElements["input"],
  { type: "range" } | { type: "checkbox" }
>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cx(inputClassName, className)}
      {...props}
    />
  );
}

const inputClassName = css`
  width: 100%;
  font-family: var(--font-mono);
  padding: 8px 16px;
  border: 2px dashed var(--mid-background);
  background: transparent;
  color: currentColor;
  
  &:focus {
    outline: none;
    border: 2px dashed var(--color);
  }
`;
