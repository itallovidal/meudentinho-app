import { safeReturnPath } from "../linking";

jest.mock("react-native", () => ({ Platform: { OS: "web" } }));

it.each([
  "/app",
  "/app/sorriso/kid-1/historico",
  "/app/perfil/dependentes/kid-1/editar",
  "/app/artigos/article-1?view=full",
])("preserves an internal destination after login: %s", (path) => {
  expect(safeReturnPath(path)).toBe(path);
});

it.each([
  undefined,
  "https://other.example/app",
  "//other.example/app",
  "/application",
  "/app/../../outside",
  "/app/login",
  "/app/cadastro?returnTo=/app",
  "/app/%6cogin",
])("rejects unsafe or recursive login destinations: %s", (path) => {
  expect(safeReturnPath(path)).toBeUndefined();
});
