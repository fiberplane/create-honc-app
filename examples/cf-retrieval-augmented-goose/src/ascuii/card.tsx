import { css } from "hono/css";
import type { PropsWithChildren } from "hono/jsx";

type CardProps = PropsWithChildren;

export function Card(props: CardProps) {
  return <div className={cardClassName} {...props} />;
}

const cardClassName = css`
  position: relative;
  border: 2px dashed var(--mid-background);
`;

type CardHeaderProps = PropsWithChildren;

export function CardHeader(props: CardHeaderProps) {
  return <div className={cardHeaderClassName} {...props} />;
}

const cardHeaderClassName = css`
  padding: 16px 16px 0;
`;

type CardContentProps = PropsWithChildren;

export function CardContent(props: CardContentProps) {
  return <div className={cardContentClassName} {...props} />;
}

const cardContentClassName = css`
  padding: 16px;
`;

type CardFooterProps = PropsWithChildren;

export function CardFooter(props: CardFooterProps) {
  return <div className={cardFooterClassName} {...props} />;
}

const cardFooterClassName = css`
  padding: 0 16px 16px;
`;

type CardTitleProps = PropsWithChildren;

export function CardTitle(props: CardTitleProps) {
  return <strong className={cardTitleClassName} {...props} />;
}

const cardTitleClassName = css`
  position: absolute;
  top: -12px;
  left: 24px;
  padding: 0 8px;
  background: black;
`;

type CardDescriptionProps = PropsWithChildren;

export function CardDescription(props: CardDescriptionProps) {
  return <p className={cardDescriptionClassName} {...props} />;
}

const cardDescriptionClassName = css`
  margin: 0;
  opacity: 0.75;
`;
