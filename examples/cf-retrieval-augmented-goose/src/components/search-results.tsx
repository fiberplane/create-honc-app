import { css } from "hono/css";

type SearchResultsProps = {
  results: Array<{ id: string; text: string; similarity: number }>;
};

export function SearchResults({ results }: SearchResultsProps) {
  if (results.length === 0) {
    return <>No results!</>;
  }

  return (
    <div className={containerClassName}>
      {results.map((result) => {
        return (
          <div key={result.id} className={resultClassName}>
            <h2 className={titleClassName}>{result.text}</h2>
            <span className={similarityClassName}>{result.similarity}</span>
          </div>
        );
      })}
    </div>
  );
}

const containerClassName = css`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const resultClassName = css`
  display: flex;
  gap: 16px;
  justifyContent: space-between;
`;

const titleClassName = css`
  margin: 0;
`;

const similarityClassName = css`
  background: var(--mid-background);
  padding: 8px;
  height: max-content;
`;
