import { copyFile, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = process.cwd();
const outputRoot = resolve(projectRoot, "dist");
const appHtml = await readFile(resolve(outputRoot, "index.html"), "utf8");

if (!appHtml.includes("/_expo/") || !appHtml.includes("<head>")) {
  throw new Error(
    "A exportação web não contém os arquivos de entrada esperados.",
  );
}

await writeFile(
  resolve(outputRoot, "app-shell.html"),
  appHtml
    .replace(/<html[^>]*>/, '<html lang="pt-BR">')
    .replace("<head>", '<head><meta name="robots" content="noindex,nofollow">'),
);
await copyFile(
  resolve(projectRoot, "web/public-site/index.html"),
  resolve(outputRoot, "index.html"),
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

console.log("Site público e aplicativo web preparados em dist/.");
