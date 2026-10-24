import { Markdown } from "react-native-remark";

export type MarkdownContentProps = {
  content: string;
};

export function MarkdownContent({ content }: MarkdownContentProps) {
  return <Markdown markdown={content} />;
}
