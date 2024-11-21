import { css } from "hono/css";
import type { PropsWithChildren } from "hono/jsx";

type InputProps = {
  id?: string;
  name?: string;
  placeholder?: string;
  defaultValue?: string;
} & PropsWithChildren;

export function Input({ defaultValue, ...props }: InputProps) {
  return <input className={inputClassName} value={defaultValue} {...props} />;
}

const inputClassName = css`
  width: 100%;
  font-family: Departure Mono, monospace;
  padding: 8px 16px;
  border: 2px dashed var(--mid-background);
  background: transparent;
  color: currentColor;
  
  &:focus {
    outline: none;
    border: 2px dashed var(--color);
  }
`;
