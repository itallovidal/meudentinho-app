import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

const outputRoot = resolve(process.cwd(), "dist");
const port = Number(process.env.WEB_PREVIEW_PORT ?? 4173);
const contentTypes: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

await readFile(resolve(outputRoot, "app-shell.html"));

const server = createServer(async function servePreview(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }
  try {
    const pathname = decodeURIComponent(
      new URL(request.url ?? "/", "http://localhost").pathname,
    );
    const destination =
      pathname === "/"
        ? "/index.html"
        : pathname === "/app" || pathname.startsWith("/app/")
          ? "/app-shell.html"
          : pathname;
    const filePath = resolve(outputRoot, `.${destination}`);
    if (!filePath.startsWith(`${outputRoot}${sep}`)) {
      response.writeHead(404).end();
      return;
    }
    let content: Buffer;
    let status = 200;
    let contentType =
      contentTypes[extname(filePath)] ?? "application/octet-stream";
    try {
      content = await readFile(filePath);
    } catch {
      content = await readFile(resolve(outputRoot, "404.html"));
      contentType = contentTypes[".html"];
      status = 404;
    }
    response.writeHead(status, {
      "Content-Type": contentType,
      "Content-Length": content.length,
      "Cache-Control": "no-store",
    });
    response.end(request.method === "HEAD" ? undefined : content);
  } catch {
    response.writeHead(400).end();
  }
});

server.listen(port, "127.0.0.1", function announcePreview() {
  console.log(`Janelinha: http://localhost:${port}/`);
});
