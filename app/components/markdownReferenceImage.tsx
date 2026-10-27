import { useMarkdownContext, type Renderers } from "react-native-remark";
import { MarkdownImage } from "@/components/markdownImage";

export function MarkdownReferenceImage({
  node,
}: Parameters<Renderers["ImageReferenceRenderer"]>[0]) {
  const { definitions } = useMarkdownContext();
  return (
    <MarkdownImage
      uri={definitions[node.identifier]?.url ?? ""}
      alt={node.alt ?? undefined}
    />
  );
}
