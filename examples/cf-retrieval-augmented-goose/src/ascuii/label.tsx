import { css } from "hono/css";
import type { PropsWithChildren } from "hono/jsx";

type LabelProps = { htmlFor?: string } & PropsWithChildren;

export function Label(props: LabelProps) {
  // biome-ignore lint/a11y/noLabelWithoutControl: TODO
  return <label className={labelClassName} {...props} />;
}

const labelClassName = css`
  color: var(--color);
`;
