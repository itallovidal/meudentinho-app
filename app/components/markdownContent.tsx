import { Linking } from "react-native";
import { Markdown, type Renderers } from "react-native-remark";
import { ARTICLE_MARKDOWN_STYLES } from "@/lib/markdownStyles";
import { MarkdownCode } from "@/components/markdownCode";
import { MarkdownImage } from "@/components/markdownImage";
import { MarkdownReferenceImage } from "@/components/markdownReferenceImage";
import { useToast } from "@/components/ui/toast";
import { isArticleLinkUrl } from "@/lib/articleUrls";

export type MarkdownContentProps = {
  content: string;
};

function renderImage({ node }: Parameters<Renderers["ImageRenderer"]>[0]) {
  return <MarkdownImage uri={node.url} alt={node.alt ?? undefined} />;
}

const articleRenderers = {
  CodeRenderer: MarkdownCode,
  ImageRenderer: renderImage,
  ImageReferenceRenderer: MarkdownReferenceImage,
};

export function MarkdownContent({ content }: MarkdownContentProps) {
  const { showToast } = useToast();

  function openLink(url: string) {
    if (!isArticleLinkUrl(url)) {
      showToast("Este link não é permitido. Use links HTTPS ou de e-mail.");
      return;
    }
    void Linking.openURL(url.trim()).catch(() => {
      showToast("Não foi possível abrir o link. Tente novamente.");
    });
  }

  return (
    <Markdown
      markdown={content}
      onLinkPress={openLink}
      customRenderers={articleRenderers}
      customStyles={ARTICLE_MARKDOWN_STYLES}
    />
  );
}
