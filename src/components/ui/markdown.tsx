import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

export const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-base font-semibold text-foreground mt-4 mb-1">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-sm font-semibold text-foreground mt-3 mb-1">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-medium text-foreground mt-2 mb-1">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-sm text-muted-foreground leading-relaxed mb-2 last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-0.5 mb-2">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-0.5 mb-2">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-foreground">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-muted-foreground">{children}</em>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.includes("language-");
    return isBlock ? (
      <code className={cn("block text-xs font-mono text-foreground", className)}>{children}</code>
    ) : (
      <code className="text-xs font-mono bg-muted text-foreground rounded px-1 py-0.5">{children}</code>
    );
  },
  pre: ({ children }) => (
    <pre className="bg-muted rounded-lg px-3 py-2 overflow-x-auto text-xs mb-2">{children}</pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-primary/40 pl-3 text-sm text-muted-foreground italic my-2">
      {children}
    </blockquote>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="border-border my-3" />,
  table: ({ children }) => (
    <div className="overflow-x-auto mb-2">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="text-left text-xs font-semibold text-foreground border-b border-border px-3 py-1.5 bg-muted/50">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="text-xs text-muted-foreground border-b border-border px-3 py-1.5">{children}</td>
  ),
};

interface MarkdownProps {
  children: string;
  className?: string;
}

export const Markdown = ({ children, className }: MarkdownProps) => (
  <div className={cn("max-w-none", className)}>
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {children}
    </ReactMarkdown>
  </div>
);
