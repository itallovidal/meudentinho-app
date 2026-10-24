import { Platform } from "react-native";

export const webLinking = {
  enabled: Platform.OS === "web",
  prefixes: [],
};

export function safeReturnPath(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.startsWith("/app")) {
    return undefined;
  }
  try {
    const url = new URL(value, "https://janelinha.invalid");
    const pathname = decodeURIComponent(url.pathname);
    if (
      url.origin !== "https://janelinha.invalid" ||
      (url.pathname !== "/app" && !url.pathname.startsWith("/app/")) ||
      /^\/app\/(login|cadastro)\/?$/.test(pathname)
    ) {
      return undefined;
    }
    return `${url.pathname}${url.search}`;
  } catch {
    return undefined;
  }
}

export function loginReturnPath(): string | undefined {
  if (Platform.OS !== "web") {
    return undefined;
  }
  return safeReturnPath(`${window.location.pathname}${window.location.search}`);
}
