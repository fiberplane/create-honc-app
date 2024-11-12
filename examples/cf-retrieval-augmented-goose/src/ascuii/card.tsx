import { css, cx } from "hono/css";
import type { JSX } from "hono/jsx";

type CardProps = JSX.IntrinsicElements["div"];

export function Card({ className, ...props }: CardProps) {
  return <div className={cx(cardClassName, className)} {...props} />;
}

const cardClassName = css`
  position: relative;
  border: 2px dashed var(--mid-background);
`;

type CardHeaderProps = JSX.IntrinsicElements["div"];

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return <div className={cx(cardHeaderClassName, className)} {...props} />;
}

const cardHeaderClassName = css`
  padding: 16px 16px 0;
`;

type CardContentProps = JSX.IntrinsicElements["div"];

export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cx(cardContentClassName, className)} {...props} />;
}

const cardContentClassName = css`
  padding: 16px;
`;

type CardFooterProps = JSX.IntrinsicElements["div"];

export function CardFooter({ className, ...props }: CardFooterProps) {
  return <div className={cx(cardFooterClassName, className)} {...props} />;
}

const cardFooterClassName = css`
  padding: 0 16px 16px;
`;

type CardTitleProps = JSX.IntrinsicElements["div"];

export function CardTitle({ className, ...props }: CardTitleProps) {
  return <strong className={cx(cardTitleClassName, className)} {...props} />;
}

const cardTitleClassName = css`
  position: absolute;
  top: -12px;
  left: 24px;
  padding: 0 8px;
  background: var(--background);
`;

type CardDescriptionProps = JSX.IntrinsicElements["div"];

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return <p className={cx(cardDescriptionClassName, className)} {...props} />;
}

const cardDescriptionClassName = css`
  margin: 0;
  opacity: 0.75;
`;
