import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

for (const file of [
  ".env.production.local",
  ".env.local",
  ".env.production",
  ".env",
]) {
  if (existsSync(file)) loadEnvFile(file);
}

const rawApiProxyTarget = process.env.API_PROXY_TARGET?.trim();

if (!rawApiProxyTarget) {
  throw new Error(
    "API_PROXY_TARGET: configure a origem HTTPS da API no ambiente da Vercel ou no .env local.",
  );
}

const apiProxyUrl = new URL(rawApiProxyTarget);

if (
  apiProxyUrl.protocol !== "https:" ||
  apiProxyUrl.username ||
  apiProxyUrl.password ||
  apiProxyUrl.pathname !== "/" ||
  apiProxyUrl.search ||
  apiProxyUrl.hash
) {
  throw new Error(
    "API_PROXY_TARGET: use uma origem HTTPS sem caminho, credenciais, query ou fragmento.",
  );
}

const apiProxyTarget = apiProxyUrl.origin;

export const config = {
  framework: null,
  installCommand: "npm ci",
  buildCommand: "npm run build:web",
  outputDirectory: "dist",
  cleanUrls: false,
  redirects: [
    {
      source: "/politica-de-privacidade.html",
      destination: "/politica-de-privacidade",
      permanent: true,
    },
  ],
  rewrites: [
    {
      source: "/auth/:path*",
      destination: `${apiProxyTarget}/auth/:path*`,
    },
    {
      source: "/users/:path*",
      destination: `${apiProxyTarget}/users/:path*`,
    },
    {
      source: "/articles/:path*",
      destination: `${apiProxyTarget}/articles/:path*`,
    },
    {
      source: "/tooth-events/:path*",
      destination: `${apiProxyTarget}/tooth-events/:path*`,
    },
    {
      source: "/politica-de-privacidade",
      destination: "/politica-de-privacidade.html",
    },
    {
      source: "/app",
      destination: "/app-shell.html",
    },
    {
      source: "/app/:path*",
      destination: "/app-shell.html",
    },
  ],
  headers: [
    {
      source: "/sw.js",
      headers: [
        {
          key: "Cache-Control",
          value: "no-cache, no-store, must-revalidate",
        },
        {
          key: "Service-Worker-Allowed",
          value: "/",
        },
      ],
    },
    {
      source: "/manifest.webmanifest",
      headers: [
        {
          key: "Content-Type",
          value: "application/manifest+json; charset=utf-8",
        },
        {
          key: "Cache-Control",
          value: "public, max-age=0, must-revalidate",
        },
      ],
    },
    {
      source: "/pwa/register.js",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=0, must-revalidate",
        },
      ],
    },
    {
      source: "/politica-de-privacidade",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=0, must-revalidate",
        },
      ],
    },
    {
      source: "/app/:path*",
      headers: [
        {
          key: "X-Robots-Tag",
          value: "noindex, nofollow",
        },
        {
          key: "Cache-Control",
          value: "public, max-age=0, must-revalidate",
        },
      ],
    },
    {
      source: "/app-shell.html",
      headers: [
        {
          key: "X-Robots-Tag",
          value: "noindex, nofollow",
        },
        {
          key: "Cache-Control",
          value: "public, max-age=0, must-revalidate",
        },
      ],
    },
  ],
};
