export type MarkdownSelection = { start: number; end: number };
export type MarkdownAction =
  | "bold"
  | "italic"
  | "strikethrough"
  | "heading1"
  | "heading3"
  | "heading"
  | "bulletList"
  | "orderedList"
  | "quote"
  | "link";

const BLOCK_FORMATS = {
  heading1: { pattern: /^# /, prefix: "# ", placeholder: "Título" },
  heading: { pattern: /^## /, prefix: "## ", placeholder: "Subtítulo" },
  heading3: { pattern: /^### /, prefix: "### ", placeholder: "Seção" },
  bulletList: { pattern: /^- /, prefix: "- ", placeholder: "Item da lista" },
  orderedList: { pattern: /^\d+\. /, prefix: "", placeholder: "Item da lista" },
  quote: { pattern: /^> /, prefix: "> ", placeholder: "Citação" },
};

type MarkdownEdit = { text: string; selection: MarkdownSelection };

function replaceSelection(
  text: string,
  start: number,
  end: number,
  replacement: string,
  selection: MarkdownSelection,
): MarkdownEdit {
  return {
    text: text.slice(0, start) + replacement + text.slice(end),
    selection,
  };
}

function wrapSelection(
  text: string,
  start: number,
  end: number,
  marker: string,
  placeholder: string,
): MarkdownEdit {
  const selected = text.slice(start, end);
  if (
    selected.length >= marker.length * 2 &&
    selected.startsWith(marker) &&
    selected.endsWith(marker)
  ) {
    const unwrapped = selected.slice(marker.length, -marker.length);
    return replaceSelection(text, start, end, unwrapped, {
      start,
      end: start + unwrapped.length,
    });
  }
  if (
    start >= marker.length &&
    text.slice(start - marker.length, start) === marker &&
    text.slice(end, end + marker.length) === marker &&
    (marker !== "*" || (text[start - 2] !== "*" && text[end + 1] !== "*"))
  ) {
    return replaceSelection(
      text,
      start - marker.length,
      end + marker.length,
      selected,
      { start: start - marker.length, end: end - marker.length },
    );
  }
  const content = selected.trim() || placeholder;
  const leading = selected.trim() ? (selected.match(/^\s*/)?.[0] ?? "") : "";
  const trailing = selected.trim() ? (selected.match(/\s*$/)?.[0] ?? "") : "";
  const contentStart = start + leading.length + marker.length;
  return replaceSelection(
    text,
    start,
    end,
    `${leading}${marker}${content}${marker}${trailing}`,
    {
      start: contentStart,
      end: contentStart + content.length,
    },
  );
}

export function applyMarkdownAction(
  text: string,
  selection: MarkdownSelection,
  action: MarkdownAction,
): MarkdownEdit {
  const start = Math.max(0, Math.min(selection.start, text.length));
  const end = Math.max(start, Math.min(selection.end, text.length));
  if (action === "bold")
    return wrapSelection(text, start, end, "**", "texto em negrito");
  if (action === "italic")
    return wrapSelection(text, start, end, "*", "texto em itálico");
  if (action === "strikethrough")
    return wrapSelection(text, start, end, "~~", "texto tachado");
  if (action === "link") {
    const label = (text.slice(start, end) || "texto do link")
      .replace(/\\/g, "\\\\")
      .replace(/\[/g, "\\[")
      .replace(/\]/g, "\\]");
    const url = "https://exemplo.com";
    const urlStart = start + label.length + 3;
    return replaceSelection(text, start, end, `[${label}](${url})`, {
      start: urlStart,
      end: urlStart + url.length,
    });
  }

  const lineStart = start === 0 ? 0 : text.lastIndexOf("\n", start - 1) + 1;
  const lastSelectedPosition =
    end > start && text[end - 1] === "\n" ? end - 1 : end;
  const nextBreak = text.indexOf("\n", lastSelectedPosition);
  const lineEnd = nextBreak === -1 ? text.length : nextBreak;
  const lines = text.slice(lineStart, lineEnd).split("\n");
  const blockFormat = BLOCK_FORMATS[action];
  const pattern = blockFormat.pattern;
  const remove =
    lines.filter((line) => line.trim()).length > 0 &&
    lines.filter((line) => line.trim()).every((line) => pattern.test(line));
  let itemNumber = 0;
  const formatted = lines
    .map((line) => {
      if (!line.trim() && lines.length > 1) return line;
      if (remove) return line.replace(pattern, "");
      const content =
        line.replace(/^(?:#{1,6} |[-+*] |\d+\. |> )/, "") ||
        blockFormat.placeholder;
      itemNumber += 1;
      const prefix =
        action === "orderedList" ? `${itemNumber}. ` : blockFormat.prefix;
      return prefix + content;
    })
    .join("\n");
  const cursor = lineStart + formatted.length;
  return replaceSelection(
    text,
    lineStart,
    lineEnd,
    formatted,
    start === end
      ? { start: cursor, end: cursor }
      : { start: lineStart, end: cursor },
  );
}
