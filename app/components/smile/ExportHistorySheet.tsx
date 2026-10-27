import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { CalendarBlankIcon } from "phosphor-react-native";
import { BottomSheet } from "@/components/ui/bottomSheet";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { DatePickerSheet } from "@/components/smile/datePickerSheet";
import { exportHistoryPdf } from "@/lib/historyPdf";
import {
  buildHistoryReportHtml,
  filterEventsByPeriod,
  resolveDefaultHistoryStartDate,
} from "@/lib/historyReport";
import { THEME } from "@/lib/theme";
import { eventDateKey, formatDatePtBR, toLocalDateKey } from "@/lib/utils";
import type { ToothEvent } from "@/types/teeth";

const colors = THEME.light;

type DateField = "start" | "end";

type ExportHistorySheetProps = {
  visible: boolean;
  kidName: string;
  kidBirthDate: string | null;
  kidGender: "male" | "female";
  kidPrematureWeeks?: string | null;
  events: ToothEvent[];
  onClose: () => void;
};

export function ExportHistorySheet({
  visible,
  kidName,
  kidBirthDate,
  kidGender,
  kidPrematureWeeks,
  events,
  onClose,
}: ExportHistorySheetProps) {
  const { showToast } = useToast();
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [pickerTarget, setPickerTarget] = useState<DateField | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const today = toLocalDateKey(new Date());
  const resolvedStart =
    startDate ?? resolveDefaultHistoryStartDate(kidBirthDate);
  const resolvedEnd = endDate ?? today;
  const birthDateKey = kidBirthDate ? eventDateKey(kidBirthDate) : "";
  const startMinDate =
    birthDateKey && birthDateKey <= today ? birthDateKey : undefined;

  const periodEvents = useMemo(
    () =>
      filterEventsByPeriod(events, {
        startDate: resolvedStart,
        endDate: resolvedEnd,
      }),
    [events, resolvedStart, resolvedEnd],
  );

  function handleConfirmDate(dateKey: string) {
    if (pickerTarget === "start") {
      setStartDate(dateKey);
      if (dateKey > resolvedEnd) {
        setEndDate(dateKey);
      }
    }
    if (pickerTarget === "end") {
      setEndDate(dateKey);
    }
    setError(null);
    setPickerTarget(null);
  }

  function handleClose() {
    setStartDate(null);
    setEndDate(null);
    setPickerTarget(null);
    setError(null);
    onClose();
  }

  function buildFailureMessage(detail: string | null) {
    if (__DEV__ && detail) {
      return `Não foi possível gerar o PDF: ${detail}`;
    }
    return "Não foi possível gerar o PDF. Tente novamente.";
  }

  function buildPdfFileName() {
    const slug = kidName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase();
    return `historico-${slug || "dependente"}-${resolvedStart}-a-${resolvedEnd}.pdf`;
  }

  async function handleExport() {
    if (isExporting) {
      return;
    }
    if (periodEvents.length === 0) {
      setError("Nenhum registro encontrado nesse período.");
      return;
    }
    setIsExporting(true);
    setError(null);
    try {
      const html = buildHistoryReportHtml({
        kidName,
        kidBirthDate,
        kidGender,
        kidPrematureWeeks,
        events: periodEvents,
        period: { startDate: resolvedStart, endDate: resolvedEnd },
      });
      const result = await exportHistoryPdf(html, {
        fileName: buildPdfFileName(),
      });
      if (result.status === "failed") {
        setError(buildFailureMessage(result.message));
        return;
      }
      showToast(
        result.status === "shared"
          ? "PDF gerado com sucesso."
          : 'Escolha "Salvar como PDF" na janela de impressão.',
      );
      handleClose();
    } catch (error) {
      setError(
        buildFailureMessage(error instanceof Error ? error.message : null),
      );
    } finally {
      setIsExporting(false);
    }
  }

  function renderDateField(label: string, value: string, onPress: () => void) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${formatDatePtBR(value) ?? value}`}
        className="w-full flex-row items-center justify-between rounded-xl border border-base-300 bg-base-100 px-4 py-3"
      >
        <View className="gap-1">
          <Text className="text-xs font-semibold uppercase text-muted-foreground">
            {label}
          </Text>
          <Text className="text-base font-bold text-primary-800">
            {formatDatePtBR(value) ?? value}
          </Text>
        </View>
        <CalendarBlankIcon size={22} color={colors.primary500} weight="regular" />
      </Pressable>
    );
  }

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      header={
        <Text className="text-xl font-bold text-base-900">
          Exportar histórico
        </Text>
      }
    >
      <Text className="text-base text-muted-foreground">
        Selecione o período para exportar os registros de {kidName} em PDF.
      </Text>
      <View className="w-full gap-3">
        {renderDateField("Data inicial", resolvedStart, () =>
          setPickerTarget("start"),
        )}
        {renderDateField("Data final", resolvedEnd, () =>
          setPickerTarget("end"),
        )}
      </View>
      <Text className="text-sm text-muted-foreground">
        {periodEvents.length === 0
          ? "Nenhum registro nesse período."
          : `${periodEvents.length} ${periodEvents.length === 1 ? "registro" : "registros"} no período`}
      </Text>
      {error ? <Text className="text-sm text-destructive">{error}</Text> : null}
      <Button
        onPress={() => void handleExport()}
        disabled={isExporting || periodEvents.length === 0}
        className="h-14 w-full rounded-full"
      >
        <Text className="text-base font-bold">
          {isExporting ? "Gerando PDF..." : "Exportar PDF"}
        </Text>
      </Button>

      <DatePickerSheet
        visible={pickerTarget !== null}
        value={pickerTarget === "end" ? resolvedEnd : resolvedStart}
        minDate={pickerTarget === "end" ? resolvedStart : startMinDate}
        maxDate={today}
        onConfirm={handleConfirmDate}
        onCancel={() => setPickerTarget(null)}
      />
    </BottomSheet>
  );
}
