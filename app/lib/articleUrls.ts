function parseArticleUrl(value: string): URL | null {
  const trimmed = value.trim();
  if (trimmed.includes("\\") || /[\r\n\t]/.test(trimmed)) {
    return null;
  }
  try {
    return new URL(trimmed);
  } catch {
    return null;
  }
}

export function isArticleImageUrl(value: string): boolean {
  const url = parseArticleUrl(value);
  return (
    !!url &&
    /^https:\/\/[^/]/i.test(value.trim()) &&
    url.protocol === "https:" &&
    url.hostname.includes(".") &&
    !url.username &&
    !url.password
  );
}

export function isArticleLinkUrl(value: string): boolean {
  const url = parseArticleUrl(value);
  if (!url) return false;
  if (url.protocol === "https:") {
    return (
      /^https:\/\/[^/]/i.test(value.trim()) &&
      !!url.hostname &&
      !url.username &&
      !url.password
    );
  }
  return url.protocol === "mailto:" && !!url.pathname;
}

export function normalizeArticleCategory(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}
