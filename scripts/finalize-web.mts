import { copyFile, cp, readFile, readdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, relative } from "node:path";
import ts from "typescript";

const projectRoot = process.cwd();
const outputRoot = resolve(projectRoot, "dist");
const appHtml = await readFile(resolve(outputRoot, "index.html"), "utf8");
const pwaHead = [
  '<link rel="manifest" href="/manifest.webmanifest">',
  '<link rel="apple-touch-icon" href="/pwa/icons/icon-180.png">',
  '<meta name="theme-color" content="hsl(213 53.4% 20.2%)">',
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-title" content="Janelinha">',
  '<script src="/pwa/register.js" defer></script>',
].join("");

if (!appHtml.includes("/_expo/") || !appHtml.includes("<head>")) {
  throw new Error(
    "A exportação web não contém os arquivos de entrada esperados.",
  );
}

await writeFile(
  resolve(outputRoot, "app-shell.html"),
  appHtml
    .replace(/<html[^>]*>/, '<html lang="pt-BR">')
    .replace(
      "<head>",
      `<head><meta name="robots" content="noindex,nofollow">${pwaHead}`,
    ),
);
await writeFile(
  resolve(outputRoot, "index.html"),
  (
    await readFile(resolve(projectRoot, "web/public-site/index.html"), "utf8")
  ).replace("<head>", `<head>${pwaHead}`),
);
await copyFile(
  resolve(projectRoot, "web/public-site/404.html"),
  resolve(outputRoot, "404.html"),
);
await copyFile(
  resolve(projectRoot, "web/public-site/politica-de-privacidade.html"),
  resolve(outputRoot, "politica-de-privacidade.html"),
);
await copyFile(
  resolve(projectRoot, "assets/new-icon.png"),
  resolve(outputRoot, "site-icon.png"),
);
await copyFile(
  resolve(projectRoot, "assets/tooth.png"),
  resolve(outputRoot, "site-tooth.png"),
);
await writeFile(
  resolve(outputRoot, "robots.txt"),
  "User-agent: *\nAllow: /\nDisallow: /app\nDisallow: /app-shell.html\n",
);

await cp(
  resolve(projectRoot, "web/pwa/icons"),
  resolve(outputRoot, "pwa/icons"),
  { recursive: true },
);
await copyFile(
  resolve(projectRoot, "web/pwa/manifest.webmanifest"),
  resolve(outputRoot, "manifest.webmanifest"),
);

function compileBrowserScript(source: string): string {
  return ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.None,
      removeComments: true,
    },
  }).outputText;
}

await writeFile(
  resolve(outputRoot, "pwa/register.js"),
  compileBrowserScript(
    await readFile(resolve(projectRoot, "web/pwa/register.ts"), "utf8"),
  ),
);

async function staticFiles(directory: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await staticFiles(path)));
    } else if (!entry.name.endsWith(".map")) {
      files.push(`/${relative(outputRoot, path).split("\\").join("/")}`);
    }
  }
  return files;
}

const precacheUrls = [
  "/app-shell.html",
  "/manifest.webmanifest",
  ...(await staticFiles(resolve(outputRoot, "pwa"))),
];
for (const directory of ["_expo", "assets"]) {
  try {
    precacheUrls.push(...(await staticFiles(resolve(outputRoot, directory))));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}
precacheUrls.sort();

const workerSource = await readFile(
  resolve(projectRoot, "web/pwa/service-worker.ts"),
  "utf8",
);
const version = createHash("sha256").update(workerSource);
for (const url of precacheUrls) {
  version.update(url).update(await readFile(resolve(outputRoot, `.${url}`)));
}
await writeFile(
  resolve(outputRoot, "sw.js"),
  compileBrowserScript(
    workerSource
      .replace("__CACHE_VERSION__", version.digest("hex").slice(0, 16))
      .replace('JSON.parse("__PRECACHE_URLS__")', JSON.stringify(precacheUrls)),
  ),
);

console.log("Site público e aplicativo web com PWA preparados em dist/.");
