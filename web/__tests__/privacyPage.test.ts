import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const policy = new DOMParser().parseFromString(
  readFileSync(resolve("web/public-site/politica-de-privacidade.html"), "utf8"),
  "text/html",
);

it("provides a standalone document with accessible section navigation", () => {
  expect(policy.documentElement.lang).toBe("pt-BR");
  expect(policy.querySelectorAll("h1")).toHaveLength(1);
  expect(policy.querySelector("main")).not.toBeNull();
  expect(policy.querySelector("script")).toBeNull();

  const ids = Array.from(policy.querySelectorAll("[id]")).map(
    (element) => element.id,
  );
  expect(new Set(ids).size).toBe(ids.length);
  for (const link of policy.querySelectorAll<HTMLAnchorElement>(
    'a[href^="#"]',
  )) {
    expect(policy.getElementById(link.hash.slice(1))).not.toBeNull();
  }
});

it("identifies the project, public contact and publication-based effective date", () => {
  const text = policy.body.textContent!.replace(/\s+/g, " ");

  expect(text).toContain("Universidade Veiga");
  expect(text).toContain("publicação do aplicativo na web");
  expect(policy.getElementById("revisao")).toBeNull();
  expect(policy.querySelector('meta[name="robots"]')).toBeNull();
  expect(
    policy.querySelector(
      '#contato a[href="mailto:suporte.janelinha@gmail.com"]',
    ),
  ).not.toBeNull();
});

it("discloses retained audit records and does not promise automatic deletion", () => {
  const retention = policy
    .getElementById("retencao")!
    .textContent!.replace(/\s+/g, " ");

  expect(retention).toContain("não apaga todos os registros de auditoria");
  expect(retention).toContain("180 dias");
  expect(retention).toContain("não representa garantia de exclusão automática");
});
