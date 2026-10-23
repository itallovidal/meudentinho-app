import { getAllArticlePreview } from "@/api/article/getAllArticles";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

jest.mock("@/lib/env", () => ({ ENV: { BASE_API_URL: "https://api.test" } }));
jest.mock("@/lib/fetchWithTimeout", () => ({
  fetchWithTimeout: jest.fn(),
}));

const request = jest.mocked(fetchWithTimeout);

beforeEach(() => {
  jest.clearAllMocks();
});

const article = {
  id: "article-1",
  title: "Titulo",
  summary: "Resumo",
  content: "Conteudo",
  readingTime: 3,
  imageCoverURL: "https://imagem.test/capa.jpg",
  categories: ["Higiene Oral"],
  createdAt: "2026-01-01T00:00:00Z",
};

function reply(
  data: unknown,
  meta?: Record<string, number | undefined>,
): ReturnType<typeof fetchWithTimeout> {
  return Promise.resolve({
    status: 200,
    json: async () => ({ status: 200, data, meta }),
  } as Response);
}

it("asks the API default page when no params are given", async () => {
  request.mockImplementation(() => reply([article]));

  await getAllArticlePreview();

  expect(request.mock.calls[0][0]).toBe("https://api.test/articles/preview");
});

it("encodes the category and the pagination into the query string", async () => {
  request.mockImplementation(() => reply([article]));

  await getAllArticlePreview({
    category: "Dicas & Cuidados",
    page: 2,
    perPage: 20,
  });

  expect(request.mock.calls[0][0]).toBe(
    "https://api.test/articles/preview?page=2&per_page=20&category=Dicas%20%26%20Cuidados",
  );
});

it("keeps an empty list and normalizes a missing meta", async () => {
  request.mockImplementation(() => reply(null, undefined));

  const payload = await getAllArticlePreview({ page: 1, perPage: 5 });

  expect(payload.data).toEqual([]);
  expect(payload.meta).toBeUndefined();
});

it("normalizes partial meta with the listed defaults", async () => {
  request.mockImplementation(() =>
    reply([article], { page: undefined, total: 7 }),
  );

  const payload = await getAllArticlePreview();

  expect(payload.meta).toEqual({
    page: 1,
    per_page: 0,
    total: 7,
    total_pages: 0,
  });
});

it("surfaces a non 200 status as an API error", async () => {
  request.mockResolvedValue({
    status: 500,
    json: async () => ({
      status: 500,
      error: { message: "Erro generico", code: "INTERNAL_SERVER_ERROR" },
    }),
  } as Response);

  await expect(getAllArticlePreview()).rejects.toMatchObject({
    code: "INTERNAL_SERVER_ERROR",
  });
});
