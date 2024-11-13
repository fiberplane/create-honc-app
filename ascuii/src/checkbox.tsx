import { css, cx } from "hono/css";
import type { JSX } from "hono/jsx";

type CheckboxProps = Omit<
  JSX.IntrinsicElements["input"] & { type: "checkbox" },
  "type"
>;

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={cx(checkboxClassName, className)}
      {...props}
    />
  );
}

const checkboxClassName = css`
  position: relative;
  appearance: none;
  background: var(--mid-background);
  width: 16px;
  height: 16px;

  &:after {
    content: '✓';
    display: flex;
    width: 16px;
    height: 16px;
    align-items: center;
    justify-content: center;
    color: var(--mid-background);
  }

  &:checked {
    background: var(--prime);
    
    &:after {
      color: var(--color);
    }
  }
`;
