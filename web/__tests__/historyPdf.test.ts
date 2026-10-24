import { exportHistoryPdf } from "../../app/lib/historyPdf.web";

beforeEach(() => {
  jest.useFakeTimers();
  document.body.innerHTML = "";
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

it("prints the report document and removes its contents after printing", async () => {
  const html =
    "<html><head><title>Histórico</title></head><body>Registro selecionado</body></html>";
  const result = exportHistoryPdf(html, { fileName: "historico.pdf" });
  const frame = document.querySelector("iframe")!;
  const printWindow = Object.assign(new EventTarget(), {
    document: { title: "" },
    focus: jest.fn(),
    print: jest.fn(),
  });
  Object.defineProperty(frame, "contentWindow", { value: printWindow });

  expect(frame.srcdoc).toBe(html);
  expect(frame.getAttribute("sandbox")).not.toContain("allow-scripts");
  frame.dispatchEvent(new Event("load"));
  await expect(result).resolves.toEqual({ status: "printed" });
  expect(printWindow.print).toHaveBeenCalledTimes(1);
  expect(printWindow.document.title).toBe("historico");

  printWindow.dispatchEvent(new Event("afterprint"));
  expect(document.querySelector("iframe")).toBeNull();
});

it("returns visible failure information when printing is unavailable", async () => {
  const result = exportHistoryPdf("<html><body>Histórico</body></html>");
  const frame = document.querySelector("iframe")!;
  Object.defineProperty(frame, "contentWindow", { value: null });
  frame.dispatchEvent(new Event("load"));
  await expect(result).resolves.toMatchObject({ status: "failed" });
  expect(document.querySelector("iframe")).toBeNull();
});

it("removes a document that never becomes ready", async () => {
  const result = exportHistoryPdf("<html><body>Histórico</body></html>");
  jest.advanceTimersByTime(10000);
  await expect(result).resolves.toMatchObject({ status: "failed" });
  expect(document.querySelector("iframe")).toBeNull();
});
