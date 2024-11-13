import { css, cx } from "hono/css";
import type { JSX } from "hono/jsx";

type TabsRootProps = JSX.IntrinsicElements["div"];

export function TabsRoot(props: TabsRootProps) {
  return <div {...props} />;
}

type TabsListProps = JSX.IntrinsicElements["nav"];

export function TabsList({ className, ...props }: TabsListProps) {
  return <nav className={cx(tabsListClassName, className)} {...props} />;
}

const tabsListClassName = css`
  display: flex;
  padding: 0 16px;
  gap: 16px;
`;

type TabsTriggerProps = JSX.IntrinsicElements["a"] & { active?: boolean };

export function TabsTrigger({
  active = false,
  className,
  ...props
}: TabsTriggerProps) {
  return (
    <a
      className={cx(
        tabsTriggerClassName,
        active && tabsTriggerActiveClassName,
        className,
      )}
      {...props}
    />
  );
}

const tabsTriggerClassName = css`
  border: 2px dashed var(--mid-background);
  border-bottom: 2px solid var(--background);
  color: var(--text);
  padding: 8px 16px;

  &:hover {
    color: var(--prime);
  }
`;

const tabsTriggerActiveClassName = css`
  color: var(--prime);
  margin-bottom: -2px;
`;

type TabsContentProps = JSX.IntrinsicElements["div"];

export function TabsContent({ className, ...props }: TabsContentProps) {
  return <div className={cx(tabsContentClassName, className)} {...props} />;
}

const tabsContentClassName = css`
  padding: 16px;
  border: 2px dashed var(--mid-background);
`;
