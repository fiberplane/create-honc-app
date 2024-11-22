import { css, cx } from "hono/css";
import type { JSX } from "hono/jsx";

type RadioButtonProps = Omit<
  JSX.IntrinsicElements["input"] & { type: "radio" },
  "type"
>;

export function RadioButton({ className, ...props }: RadioButtonProps) {
  return (
    <input
      type="radio"
      className={cx(radioButtonClassName, className)}
      {...props}
    />
  );
}

const radioButtonClassName = css`
  position: relative;
  appearance: none;
  background: var(--mid-background);
  width: 16px;
  height: 16px;
  border-radius: 16px;

  &:after {
    content: ' ';
    position: absolute;
    top: 4px;
    right: 4px;
    bottom: 4px;
    left: 4px;
    background: var(--mid-background);
    border-radius: 8px;
  }

  &:checked {
    background: var(--prime);
    
    &:after {
      background: var(--color);
    }
  }
`;
