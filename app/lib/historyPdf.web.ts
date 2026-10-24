import type { HistoryPdfExportResult } from "./historyPdf";

export async function exportHistoryPdf(
  html: string,
  options: { fileName?: string } = {},
): Promise<HistoryPdfExportResult> {
  return new Promise(function preparePrint(resolve) {
    const frame = document.createElement("iframe");
    frame.title = "Impressão do histórico";
    frame.setAttribute("aria-hidden", "true");
    frame.setAttribute("sandbox", "allow-same-origin allow-modals");
    frame.tabIndex = -1;
    Object.assign(frame.style, {
      position: "fixed",
      width: "1px",
      height: "1px",
      right: "0",
      bottom: "0",
      opacity: "0",
      pointerEvents: "none",
    });

    let settled = false;
    const loadTimeout = window.setTimeout(function handleLoadTimeout() {
      if (!settled) {
        settled = true;
        frame.remove();
        resolve({
          status: "failed",
          message: "O documento de impressão não pôde ser preparado.",
        });
      }
    }, 10000);

    frame.onload = function printReport() {
      if (settled) {
        return;
      }
      settled = true;
      window.clearTimeout(loadTimeout);
      let cleanupTimeout: number | undefined;
      try {
        const printWindow = frame.contentWindow;
        if (!printWindow) {
          throw new Error("A impressão não está disponível neste navegador.");
        }
        if (options.fileName) {
          printWindow.document.title = options.fileName.replace(/\.pdf$/i, "");
        }
        cleanupTimeout = window.setTimeout(function removePrintFrame() {
          frame.remove();
        }, 60000);
        printWindow.addEventListener(
          "afterprint",
          function finishPrint() {
            window.clearTimeout(cleanupTimeout);
            frame.remove();
          },
          { once: true },
        );
        printWindow.focus();
        printWindow.print();
        resolve({ status: "printed" });
      } catch (error) {
        window.clearTimeout(cleanupTimeout);
        frame.remove();
        resolve({
          status: "failed",
          message:
            error instanceof Error
              ? error.message
              : "Não foi possível abrir a impressão do histórico.",
        });
      }
    };
    frame.srcdoc = html;
    document.body.appendChild(frame);
  });
}
