import { memo } from "react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { DetailedHTMLProps, HTMLAttributes } from "react";

interface AIMarkdownProps {
  content: string;
}

interface CodeProps extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  node?: {
    position?: {
      start: {
        line: number;
      };
    };
  };
}

// A component that renders markdown content
const AIMarkdownImpl = ({ content }: AIMarkdownProps) => {
  return (
    <div className="whitespace-normal [&_li>p]:inline [&_li>p]:m-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ className, ...props }) => (
            <h1 className={cn("text-2xl font-bold mb-2", className)} {...props} />
          ),
          h2: ({ className, ...props }) => (
            <h2 className={cn("text-xl font-bold mb-1", className)} {...props} />
          ),
          h3: ({ className, ...props }) => (
            <h3 className={cn("text-lg font-bold mb-1", className)} {...props} />
          ),
          h4: ({ className, ...props }) => (
            <h4 className={cn("text-base font-bold mb-1", className)} {...props} />
          ),
          h5: ({ className, ...props }) => (
            <h5 className={cn("text-sm font-bold mb-1", className)} {...props} />
          ),
          h6: ({ className, ...props }) => (
            <h6 className={cn("text-xs font-bold mb-1", className)} {...props} />
          ),
          
          
          p: ({ className, ...props }) => (
            <p className={cn("mb-1 leading-relaxed", className)} {...props} />
          ),
          a: ({ className, ...props }) => (
            <a className={cn("text-primary hover:text-primary/80 underline underline-offset-4 decoration-border/40", className)} {...props} />
          ),
          ul: ({ className, ...props }) => (
            <ul className={cn("ml-6 list-disc my-2 space-y-1", className)} {...props} />
          ),
          ol: ({ className, ...props }) => (
            <ol className={cn("ml-6 list-decimal my-2 space-y-1", className)} {...props} />
          ),
          li: ({ className, ...props }) => (
            <li className={cn("my-1 marker:text-muted-foreground/60", className)} {...props} />
          ),
          code: ({ className, ...props }: CodeProps) => {
            const isInline = !props.node?.position?.start.line;
            return (
              <code 
                className={cn(
                  "font-mono text-sm",
                  isInline ? "bg-muted/50 text-primary rounded-md px-1.5 py-0.5" : "",
                  className
                )} 
                {...props} 
              />
            );
          },
          pre: ({ className, ...props }) => (
            <pre className={cn("overflow-x-auto rounded-xl bg-card/80 border border-border/40 p-4 text-foreground my-3", className)} {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export const AIMarkdown = memo(AIMarkdownImpl); 