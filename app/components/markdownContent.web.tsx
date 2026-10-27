import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { MarkdownImage } from "@/components/markdownImage";
import { MarkdownLink } from "@/components/markdownLink.web";
import type { MarkdownContentProps } from "./markdownContent";

const components: Components = {
  a: MarkdownLink,
  img({ src, alt }) {
    return <MarkdownImage uri={typeof src === "string" ? src : ""} alt={alt} />;
  },
};

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div
      className="article-markdown w-full min-w-0"
      data-testid="article-markdown"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
        skipHtml
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
