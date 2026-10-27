import type { ComponentProps } from "react";
import type { Markdown } from "react-native-remark";
import { THEME } from "./themeColors";

const colors = THEME.light;

export const ARTICLE_MARKDOWN_STYLES: NonNullable<
  ComponentProps<typeof Markdown>["customStyles"]
> = {
  paragraph: { color: colors.base800, fontSize: 16, lineHeight: 28 },
  heading: function heading(level) {
    return {
      color: colors.primary800,
      fontSize: Math.max(18, 30 - level * 2),
      fontWeight: "700",
      marginVertical: 8,
    };
  },
  link: { color: colors.primary, textDecorationLine: "underline" },
  linkReference: { color: colors.primary, textDecorationLine: "underline" },
  footnoteReference: { color: colors.mutedForeground },
  tableCell: { color: colors.base800 },
  borderColor: colors.base300,
  blockquote: {
    backgroundColor: colors.secondary100,
    borderLeftColor: colors.primary300,
  },
  inlineCode: { color: colors.base800, backgroundColor: colors.base200 },
  codeBlock: {
    headerBackgroundColor: colors.base200,
    contentBackgroundColor: colors.base200,
    headerTextStyle: { color: colors.mutedForeground },
    contentTextStyle: { color: colors.base800 },
  },
};
