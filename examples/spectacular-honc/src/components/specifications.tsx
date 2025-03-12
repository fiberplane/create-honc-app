import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import type { Specification } from "@/db/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function SpecModal() {
  const [specs, setSpecs] = useState<Array<Specification>>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/specifications')
      .then(response => response.json())
      .then(data => setSpecs(data as Array<Specification>))
      .catch(error => console.error('Error fetching specifications:', error));
  }, []);

  const copyToClipboard = (content: string, id: number) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="p-2.5 rounded-full bg-background/50 hover:bg-muted shadow-none cursor-pointer transition-colors duration-200"
          aria-label="Open Specs"
        >
          📋
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Specifications</DialogTitle>
        </DialogHeader>
        {specs.length > 0 ? (
          <ul>
            {specs.map(spec => (
              <li key={spec.id} className="mb-2 flex items-center justify-between">
                <div className="bg-muted p-2 rounded truncate flex-1 mr-2">{spec.title}</div>
                <Button onClick={() => copyToClipboard(spec.content, spec.id)} className="shrink-0">
                  {copiedId === spec.id ? "Copied!" : "Copy"}
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No specifications available.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}