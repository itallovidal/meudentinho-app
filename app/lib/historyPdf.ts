import { Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";

export type HistoryPdfExportResult =
  | { status: "shared" }
  | { status: "printed" }
  | { status: "failed"; message: string };

type ExportHistoryPdfOptions = {
  fileName?: string;
};

function describeError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return String(error);
}

function writePdfFile(
  base64: string | null | undefined,
  fileName: string,
): string | null {
  if (!base64) {
    return null;
  }
  try {
    const destination = new File(Paths.cache, fileName);
    if (destination.exists) {
      destination.delete();
    }
    destination.create({ overwrite: true });
    destination.write(base64, { encoding: "base64" });
    return destination.uri;
  } catch {
    return null;
  }
}

async function sharePdf(uri: string): Promise<boolean> {
  try {
    if (!(await Sharing.isAvailableAsync())) {
      return false;
    }
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: "Exportar histórico em PDF",
      UTI: "com.adobe.pdf",
    });
    return true;
  } catch {
    return false;
  }
}

export async function exportHistoryPdf(
  html: string,
  options: ExportHistoryPdfOptions = {},
): Promise<HistoryPdfExportResult> {
  if (Platform.OS === "web") {
    try {
      await Print.printToFileAsync({ html });
      return { status: "printed" };
    } catch (error) {
      return { status: "failed", message: describeError(error) };
    }
  }

  let pdfUri: string | null = null;
  let pdfBase64: string | null = null;

  try {
    const result = await Print.printToFileAsync({ html, base64: true });
    pdfUri = result?.uri ?? null;
    pdfBase64 = result?.base64 ?? null;
  } catch {
    try {
      const result = await Print.printToFileAsync({ html });
      pdfUri = result?.uri ?? null;
    } catch {
      pdfUri = null;
    }
  }

  if (pdfUri) {
    const fileName = options.fileName ?? "historico-janelinha.pdf";
    const shareUri = writePdfFile(pdfBase64, fileName) ?? pdfUri;
    if (await sharePdf(shareUri)) {
      return { status: "shared" };
    }
  }

  try {
    await Print.printAsync({ html });
    return { status: "printed" };
  } catch (error) {
    return { status: "failed", message: describeError(error) };
  }
}
