import { css } from "hono/css";
import { html } from "hono/html";
import type { FC } from "hono/jsx";
import type { Website, websites } from "../db/schema";

const styles = {
  container: css`
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, -apple-system, sans-serif;
  `,
  header: css`
    color: #2563eb;
    font-size: 2rem;
    margin-bottom: 2rem;
  `,
  grid: css`
    display: grid;
    gap: 1rem;
  `,
  card: css`
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1rem;
    background: white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  `,
  websiteName: css`
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
  `,
  websiteUrl: css`
    color: #4b5563;
    margin-bottom: 0.5rem;
  `,
  interval: css`
    color: #6b7280;
    font-size: 0.875rem;
  `,
};

type Props = {
  websites: Array<Website>;
};

export const WebsiteList: FC<Props> = ({ websites }) => {
  return (
    <div class={styles.container}>
      <h1 class={styles.header}>🪿 Website Monitor</h1>
      <div class={styles.grid}>
        {websites.map((website) => (
          <div class={styles.card} key={website.id}>
            <div class={styles.websiteName}>{website.name}</div>
            <div class={styles.websiteUrl}>
              <a href={website.url} target="_blank" rel="noopener noreferrer">
                {website.url}
              </a>
            </div>
            <div class={styles.interval}>
              Checking every {website.checkInterval} seconds
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
