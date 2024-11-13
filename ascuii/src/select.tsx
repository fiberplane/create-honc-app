import { css, cx } from "hono/css";
import type { JSX } from "hono/jsx";

type SelectProps = JSX.IntrinsicElements["select"];

export function Select({ className, ...props }: SelectProps) {
  return <select className={cx(selectClassName, className)} {...props} />;
}

const selectClassName = css`
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

type SelectOptionProps = JSX.IntrinsicElements["option"];

export function SelectOption(props: SelectOptionProps) {
  return <option {...props} />;
}
