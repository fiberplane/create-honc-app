import { css, cx } from "hono/css";
import type { JSX } from "hono/jsx";

type SeparatorProps = JSX.IntrinsicElements["div"] & {
  direction?: "horizontal" | "vertical";
};

export function Separator({
  className,
  direction = "horizontal",
  ...props
}: SeparatorProps) {

  return (
    <div
      className={cx(
        separatorClassName,
        direction === "horizontal" && horizontalSeparatorClassName,
        direction === "vertical" && verticalSeparatorClassName,
        className ?? "",
      )}
      {...props}
    />
  );
}

const separatorClassName = css`
  color: var(--mid-background);
`;

const horizontalSeparatorClassName = css`
  margin: 16px 0;
  height: 2px;
  border-top: 2px dashed currentColor;
  width: auto;
`;

const verticalSeparatorClassName = css`
  margin: 0 16px ;
  border-right: 2px dashed currentColor;
  height: auto;
`;