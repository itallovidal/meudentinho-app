import { articleSchema } from "@/lib/schemas/article";
import {
  isArticleImageUrl,
  isArticleLinkUrl,
  normalizeArticleCategory,
} from "@/lib/articleUrls";

const valid = {
  title: "Cuidados com o sorriso",
  summary: "Cuidados diários com os dentes.",
  content: "## Rotina\n\n**Escove os dentes** todos os dias.",
  categories: ["Higiene"],
  imageCoverURL: "https://example.com/cover.jpg",
};

it.each(["title", "summary", "content"])(
  "rejects whitespace-only %s",
  (field) => {
    expect(
      articleSchema.safeParse({ ...valid, [field]: " ".repeat(30) }).success,
    ).toBe(false);
  },
);

it("trims boundaries without changing markdown formatting", () => {
  const parsed = articleSchema.parse({
    ...valid,
    title: `  ${valid.title}  `,
    summary: `  ${valid.summary}  `,
    content: `\n${valid.content}\n`,
    categories: [" Higiene "],
    imageCoverURL: ` ${valid.imageCoverURL} `,
  });
  expect(parsed).toEqual(valid);
});

it.each([
  { categories: [] },
  { categories: [""] },
  { categories: ["   "] },
  { categories: ["Higiene", "Prevenção"] },
])("requires exactly one nonblank category: %j", ({ categories }) => {
  expect(articleSchema.safeParse({ ...valid, categories }).success).toBe(false);
});

it.each([
  "http://example.com/image.jpg",
  "ftp://example.com/image.jpg",
  "file:///image.jpg",
  "data:image/png;base64,a",
  "javascript:alert(1)",
  "/image.jpg",
  "//example.com/image.jpg",
  "https://localhost/image.jpg",
  "https:///example.com/image.jpg",
  "https://example.com\\image.jpg",
  "https://exa\nmple.com/image.jpg",
])("blocks image URL %s", (url) => {
  expect(isArticleImageUrl(url)).toBe(false);
  expect(articleSchema.shape.imageCoverURL.safeParse(url).success).toBe(false);
});

it("allows HTTPS media across domains", () => {
  expect(isArticleImageUrl("https://cdn.example.org/image.jpg")).toBe(true);
});

it.each(["https://example.com/article", "mailto:contato@example.com"])(
  "allows external destination %s",
  (url) => {
    expect(isArticleLinkUrl(url)).toBe(true);
  },
);

it.each([
  "http://example.com",
  "javascript:alert(1)",
  "tel:123",
  "file:///etc/passwd",
  "/article",
  "#section",
  "//example.com",
  "mailto:",
  "https:example.com",
  "https:///example.com",
  "https://example.com\\page",
  "https://exa\nmple.com",
])("blocks link destination %s", (url) => {
  expect(isArticleLinkUrl(url)).toBe(false);
});

it("matches canonical category names despite case, accents and spaces", () => {
  expect(normalizeArticleCategory("  HIGIENE   e Prevenção ")).toBe(
    normalizeArticleCategory("higiene e prevencao"),
  );
});
