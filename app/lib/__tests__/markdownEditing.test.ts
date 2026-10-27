import {
  applyMarkdownAction,
  type MarkdownAction,
} from "@/lib/markdownEditing";

it("formats only the selected text and preserves surrounding content", () => {
  expect(
    applyMarkdownAction("Antes sorriso depois", { start: 6, end: 13 }, "bold"),
  ).toEqual({
    text: "Antes **sorriso** depois",
    selection: { start: 8, end: 15 },
  });
});

it("inserts selected placeholder text at the cursor", () => {
  const result = applyMarkdownAction("Olá ", { start: 4, end: 4 }, "italic");
  expect(result.text).toBe("Olá *texto em itálico*");
  expect(result.text.slice(result.selection.start, result.selection.end)).toBe(
    "texto em itálico",
  );
});

it("keeps whitespace outside emphasis so markdown renders the formatting", () => {
  expect(
    applyMarkdownAction("um texto aqui", { start: 2, end: 9 }, "bold").text,
  ).toBe("um **texto** aqui");
});

it("removes bold when formatting the selected contents a second time", () => {
  const formatted = applyMarkdownAction(
    "sorriso",
    { start: 0, end: 7 },
    "bold",
  );
  expect(
    applyMarkdownAction(formatted.text, formatted.selection, "bold"),
  ).toEqual({
    text: "sorriso",
    selection: { start: 0, end: 7 },
  });
});

it("removes selected markdown delimiters", () => {
  expect(
    applyMarkdownAction("**sorriso**", { start: 0, end: 11 }, "bold").text,
  ).toBe("sorriso");
});

it("formats only the current line as a heading", () => {
  expect(
    applyMarkdownAction(
      "Antes\nTítulo\nDepois",
      { start: 8, end: 8 },
      "heading",
    ).text,
  ).toBe("Antes\n## Título\nDepois");
});

it("formats multiple selected lines without including the next unselected line", () => {
  expect(
    applyMarkdownAction("Um\nDois\nTrês", { start: 0, end: 8 }, "bulletList")
      .text,
  ).toBe("- Um\n- Dois\nTrês");
});

it("numbers nonempty lines and preserves paragraph breaks", () => {
  const text = "Um\n\nDois";
  expect(
    applyMarkdownAction(text, { start: 0, end: text.length }, "orderedList")
      .text,
  ).toBe("1. Um\n\n2. Dois");
});

it("toggles lists off and switches list styles", () => {
  const text = "- Um\n- Dois";
  expect(
    applyMarkdownAction(text, { start: 0, end: text.length }, "bulletList")
      .text,
  ).toBe("Um\nDois");
  expect(
    applyMarkdownAction(text, { start: 0, end: text.length }, "orderedList")
      .text,
  ).toBe("1. Um\n2. Dois");
});

it("inserts an empty heading before an initial newline", () => {
  expect(
    applyMarkdownAction("\nTexto", { start: 0, end: 0 }, "heading").text,
  ).toBe("## Subtítulo\nTexto");
});

it("quotes each selected line and removes the quotes on repeated use", () => {
  const text = "Um\nDois";
  const result = applyMarkdownAction(
    text,
    { start: 0, end: text.length },
    "quote",
  );
  expect(result.text).toBe("> Um\n> Dois");
  expect(applyMarkdownAction(result.text, result.selection, "quote").text).toBe(
    text,
  );
});

it("inserts a link and selects its destination for replacement", () => {
  const result = applyMarkdownAction("Leia mais", { start: 0, end: 9 }, "link");
  expect(result.text).toBe("[Leia mais](https://exemplo.com)");
  expect(result.text.slice(result.selection.start, result.selection.end)).toBe(
    "https://exemplo.com",
  );
});

it("escapes brackets in link labels", () => {
  const text = "Leia [aqui]";
  expect(
    applyMarkdownAction(text, { start: 0, end: text.length }, "link").text,
  ).toBe("[Leia \\[aqui\\]](https://exemplo.com)");
});

it("clamps outdated cursor positions after the content becomes shorter", () => {
  expect(applyMarkdownAction("Olá", { start: 20, end: 30 }, "bold").text).toBe(
    "Olá**texto em negrito**",
  );
});

it("adds italic inside bold without removing bold delimiters", () => {
  expect(
    applyMarkdownAction("**sorriso**", { start: 2, end: 9 }, "italic").text,
  ).toBe("***sorriso***");
});

it.each<[MarkdownAction, string]>([
  ["heading1", "# "],
  ["heading", "## "],
  ["heading3", "### "],
])("switches heading levels and toggles %s off", (action, prefix) => {
  const source = "Antes\n## Cuidados\nDepois";
  const result = applyMarkdownAction(source, { start: 9, end: 9 }, action);
  if (action === "heading") {
    expect(result.text).toBe("Antes\nCuidados\nDepois");
  } else {
    expect(result.text).toBe(`Antes\n${prefix}Cuidados\nDepois`);
    expect(
      applyMarkdownAction(result.text, result.selection, action).text,
    ).toBe("Antes\nCuidados\nDepois");
  }
});

it("applies H3 to selected lines without including the next paragraph", () => {
  expect(
    applyMarkdownAction("Um\nDois\nTrês", { start: 0, end: 8 }, "heading3")
      .text,
  ).toBe("### Um\n### Dois\nTrês");
});

it("wraps selected text in strikethrough markers and toggles them off", () => {
  const text = "Antes sorriso depois";
  const result = applyMarkdownAction(
    text,
    { start: 6, end: 13 },
    "strikethrough",
  );
  expect(result.text).toBe("Antes ~~sorriso~~ depois");
  expect(result.text.slice(result.selection.start, result.selection.end)).toBe(
    "sorriso",
  );
  expect(
    applyMarkdownAction(result.text, result.selection, "strikethrough").text,
  ).toBe(text);
});
