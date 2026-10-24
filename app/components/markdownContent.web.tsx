import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { MarkdownContentProps } from "./markdownContent";

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div
      className="article-markdown w-full min-w-0"
      data-testid="article-markdown"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>
        {content}
      </ReactMarkdown>
    </div>
  );
}
