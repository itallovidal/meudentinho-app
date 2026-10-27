import type { ComponentProps } from "react";
import { ExternalLink } from "@/components/externalLink";
import { useToast } from "@/components/ui/toast";
import { isArticleLinkUrl } from "@/lib/articleUrls";

export function MarkdownLink({ href = "", children }: ComponentProps<"a">) {
  const { showToast } = useToast();

  function reportBlockedLink() {
    showToast("Este link não é permitido. Use links HTTPS ou de e-mail.");
  }

  if (!isArticleLinkUrl(href)) {
    return (
      <a
        role="button"
        tabIndex={0}
        onClick={reportBlockedLink}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            reportBlockedLink();
          }
        }}
      >
        {children}
      </a>
    );
  }
  return <ExternalLink href={href.trim()}>{children}</ExternalLink>;
}
