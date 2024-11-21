import { css } from "hono/css";

type SliderProps = {
  id?: string;
  name?: string;
  defaultValue?: number;
  max?: number;
  step?: number;
};

export function Slider({ name, defaultValue, max, step }: SliderProps) {
  return (
    <input
      type="range"
      name={name}
      value={defaultValue}
      max={max}
      step={step}
      className={sliderClassName}
    />
  );
}

const sliderClassName = css`
  width: 100%;
  background: transparent;

  &::-webkit-slider-thumb,
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    cursor: pointer;
    border-radius: 0;
    background: var(--prime);
    border: none;
  }

  &::-webkit-slider-runnable-track,
  &::-moz-range-track {
    width: 100%;
    height: 8px;
    background: var(--mid-background);
    border-radius: 0;
  }
`;
