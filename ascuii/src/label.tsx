import { css, cx } from "hono/css";
import type { JSX } from "hono/jsx";

type LabelProps = JSX.IntrinsicElements["label"];

export function Label({ className, ...props }: LabelProps) {
  return <label className={cx(labelClassName, className)} {...props} />;
}

const labelClassName = css`
  color: var(--color);
`;
