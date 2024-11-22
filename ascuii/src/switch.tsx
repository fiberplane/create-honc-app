import { css, cx } from "hono/css";
import type { JSX } from "hono/jsx";

type SwitchedProps = Omit<
  JSX.IntrinsicElements["input"] & { type: "checkbox" },
  "type"
>;

export function Switch({ className, ...props }: SwitchedProps) {
  return (
    <input
      type="checkbox"
      className={cx(switchClassName, className)}
      {...props}
    />
  );
}

const switchClassName = css`
  position: relative;
  appearance: none;
  background: var(--mid-background);
  width: 32px;
  height: 16px;
  border-radius: 16px;

  &:after {
    content: ' ';
    position: absolute;
    top: 2px;
    bottom: 2px;
    left: 2px;
    background: var(--color);
    width: 12px;
    border-radius: 8px;
    transition: all .2s ease-in-out;
  }

  &:checked {
    background: var(--prime);
    
    &:after {
      width: 12px;
      left: 18px;
      top: 2px;
      bottom: 2px;
    }
  }
`;
