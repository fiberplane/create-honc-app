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
          p: ({ className, ...props }) => (
            <p className={cn("mb-1 leading-normal", className)} {...props} />
          ),
          a: ({ className, ...props }) => (
            <a className={cn("text-blue-400 hover:text-blue-300 underline underline-offset-4", className)} {...props} />
          ),
          ul: ({ className, ...props }) => (
            <ul className={cn("ml-5 list-disc my-1", className)} {...props} />
          ),
          ol: ({ className, ...props }) => (
            <ol className={cn("ml-5 list-decimal my-1", className)} {...props} />
          ),
          li: ({ className, ...props }) => (
            <li className={cn("my-0.5 marker:text-gray-400", className)} {...props} />
          ),
          code: ({ className, ...props }: CodeProps) => {
            const isInline = !props.node?.position?.start.line;
            return (
              <code 
                className={cn(
                  "font-mono text-sm",
                  isInline ? "bg-gray-800 rounded px-1 py-0.5" : "",
                  className
                )} 
                {...props} 
              />
            );
          },
          pre: ({ className, ...props }) => (
            <pre className={cn("overflow-x-auto rounded-lg bg-gray-900 p-3 text-white my-2", className)} {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export const AIMarkdown = memo(AIMarkdownImpl); 