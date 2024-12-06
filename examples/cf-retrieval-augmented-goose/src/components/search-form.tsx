import { css } from "hono/css";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Slider } from "./slider";
import { APP_NAME } from "../constants";

type SearchFormProps = {
  similarity?: number;
  query?: string;
};

export function SearchForm({ similarity, query }: SearchFormProps) {
  return (
    <form method="get" action="/search">
      <Card>
        <CardHeader>
          <CardTitle>{APP_NAME}</CardTitle>
          <CardDescription>Search Cloudflare docs using RAG</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={formContainerClassName}>
            <Label htmlFor="query">Query</Label>
            <Input
              id="query"
              name="query"
              placeholder="Search query"
              value={query}
            />
            <Label htmlFor="similarity">Similarity</Label>
            <Slider
              id="similarity"
              name="similarity"
              value={similarity}
              max={1}
              step={0.1}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Honc! 🪿</Button>
        </CardFooter>
      </Card>
    </form>
  );
}

const formContainerClassName = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
