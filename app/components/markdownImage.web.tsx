import { useState } from "react";
import { isArticleImageUrl } from "@/lib/articleUrls";
import type { MarkdownImageProps } from "./markdownImage";

export function MarkdownImage({ uri, alt }: MarkdownImageProps) {
  const [failedUri, setFailedUri] = useState<string | null>(null);
  if (!isArticleImageUrl(uri) || failedUri === uri) {
    return (
      <span role="img" aria-label={alt || "Imagem do artigo"}>
        Imagem indisponível
      </span>
    );
  }
  return (
    <img
      src={uri.trim()}
      alt={alt || "Imagem do artigo"}
      loading="lazy"
      onError={() => setFailedUri(uri)}
    />
  );
}
