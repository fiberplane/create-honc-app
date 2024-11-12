import { css, cx } from "hono/css";
import type { JSX } from "hono/jsx";

type LabelProps = JSX.IntrinsicElements["label"];

export function Label({ className, ...props }: LabelProps) {
  // biome-ignore lint/a11y/noLabelWithoutControl: Should be implemented by the consumer
  return <label className={cx(labelClassName, className)} {...props} />;
}

const labelClassName = css`
  color: var(--color);
`;
