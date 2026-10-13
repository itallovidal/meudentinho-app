import React, { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ConfirmDialog } from "@/components/ui/confirmDialog";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { CustomCalendar } from "@/components/calendar";
import { CalendarBlankIcon, CheckIcon, XIcon } from "phosphor-react-native";
import { THEME } from "@/lib/theme";
import {
  ageInMonths,
  cn,
  formatDatePtBR,
  localDateKeyToISO,
  toLocalDateKey,
} from "@/lib/utils";
import { expectedDentition, pendingDeciduousFall } from "@/lib/toothChronology";
import {
  dentitionLabel,
  parseToothId,
  toothEventVerb,
  toothIdLabel,
  toothTypeLabel,
} from "@/lib/teethLabels";
import type {
  Dentition,
  ToothEvent,
  ToothEventRequestDTO,
} from "@/types/teeth";

const colors = THEME.light;

export function ToothEventModal({
  visible,
  toothId,
  kidId,
  kidBirthDate,
  toothEvents,
  events,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  toothId: string | null;
  kidId: string | null;
  kidBirthDate: string | null;
  toothEvents: ToothEvent[];
  events: ToothEvent[];
  onClose: () => void;
  onSubmit: (
    payload: ToothEventRequestDTO,
    editingId: string | null,
  ) => Promise<void>;
}) {
  const [eventType, setEventType] = useState<"eruption" | "exfoliation">(
    "eruption",
  );
  const [dentition, setDentition] = useState<Dentition>("primary");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => toLocalDateKey(new Date()));
  const [showCalendar, setShowCalendar] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const parsed = parseToothId(toothId);
  const ageMonths = kidBirthDate !== null ? ageInMonths(kidBirthDate) : null;
  const defaultDentition =
    parsed !== null
      ? expectedDentition(parsed.toothType, parsed.arch, ageMonths)
      : "primary";

  function loadRecord(
    record: ToothEvent | undefined,
    fallbackDentition: Dentition,
  ) {
    setEditingId(record?.id ?? null);
    setDentition(record?.dentition ?? fallbackDentition);
    setNote(record?.note ?? "");
    setDate(
      record ? record.occurrenceDate.split("T")[0] : toLocalDateKey(new Date()),
    );
    setShowCalendar(false);
  }

  useEffect(() => {
    if (!visible) {
      return;
    }
    setEventType("eruption");
    loadRecord(
      toothEvents.find((event) => event.eventType === "eruption"),
      defaultDentition,
    );
  }, [visible, toothId]);

  function changeEventType(next: "eruption" | "exfoliation") {
    setEventType(next);
    loadRecord(
      toothEvents.find((event) => event.eventType === next),
      defaultDentition,
    );
  }

  async function performSave() {
    if (!parsed || !kidId) {
      return;
    }
    const occurrenceDate = localDateKeyToISO(date);
    if (!occurrenceDate) {
      return;
    }
    await onSubmit(
      {
        kidId,
        occurrenceDate,
        dentition,
        arch: parsed.arch,
        side: parsed.side,
        toothType: parsed.toothType,
        eventType,
        quadrant: parsed.quadrant,
        note: note.trim() ? note.trim() : undefined,
      },
      editingId,
    );
  }

  function handleConfirmPress() {
    void performSave();
  }

  const editingRecord = editingId
    ? toothEvents.find((event) => event.id === editingId)
    : undefined;

  const pendingCounterpart =
    parsed !== null && eventType === "eruption" && dentition === "permanent"
      ? pendingDeciduousFall(parsed.quadrant, parsed.toothType, events)
      : null;

  const confirmDisabled = !parsed || pendingCounterpart !== null;

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={onClose}
      >
        <View className="flex-1 justify-end bg-black/50">
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Fechar"
            className="absolute inset-0"
          />
          <SafeAreaView
            edges={["bottom"]}
            className="w-full rounded-t-3xl bg-base-100"
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingTop: 12,
                paddingBottom: 24,
                gap: 20,
              }}
            >
              <View className="h-1 w-12 self-center rounded-full bg-base-300" />

              <View className="flex-row items-start gap-4">
                <View className="flex-1">
                  <Text className="text-xl font-bold text-base-900">
                    {toothIdLabel(toothId)}
                  </Text>
                  {editingRecord && (
                    <Text className="mt-1 text-sm text-base-500">
                      {`Editando registro de ${formatDatePtBR(editingRecord.occurrenceDate) ?? ""}`}
                    </Text>
                  )}
                </View>
                <Pressable
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityLabel="Fechar"
                  hitSlop={8}
                  className="h-8 w-8 items-end justify-start"
                >
                  <XIcon size={24} color={colors.base500} weight="bold" />
                </Pressable>
              </View>

              <View className="gap-3">
                <Text className="text-base text-base-500">
                  O que aconteceu?
                </Text>
                <View className="flex-row gap-3">
                  <Chip
                    label={toothEventVerb("eruption")}
                    selected={eventType === "eruption"}
                    onPress={() => changeEventType("eruption")}
                  />
                  <Chip
                    label={toothEventVerb("exfoliation")}
                    selected={eventType === "exfoliation"}
                    onPress={() => changeEventType("exfoliation")}
                  />
                </View>
              </View>

              <View className="gap-3">
                <Text className="text-base text-base-500">Dentição</Text>
                <View className="flex-row gap-3">
                  <Chip
                    label={dentitionLabel("primary")}
                    selected={dentition === "primary"}
                    onPress={() => setDentition("primary")}
                  />
                  <Chip
                    label={dentitionLabel("permanent")}
                    selected={dentition === "permanent"}
                    onPress={() => setDentition("permanent")}
                  />
                </View>
              </View>

              <View className="gap-3">
                <Text className="text-base text-base-500">
                  Data do acontecimento
                </Text>
                <View className="flex-row items-center gap-2">
                  <Input
                    editable={false}
                    value={formatDatePtBR(date) ?? date}
                    className="flex-1"
                  />
                  <Pressable
                    onPress={() => setShowCalendar((current) => !current)}
                    accessibilityRole="button"
                    accessibilityLabel="Abrir calendário"
                    className="h-14 w-14 items-center justify-center rounded-md bg-base-200"
                  >
                    <CalendarBlankIcon size={22} color={colors.base600} />
                  </Pressable>
                </View>
                {showCalendar && (
                  <CustomCalendar
                    onDayPress={(day) => {
                      setDate(day.dateString);
                      setShowCalendar(false);
                    }}
                    markedDates={{
                      [date]: {
                        selected: true,
                        selectedColor: colors.primary500,
                        selectedTextColor: colors.base100,
                      },
                    }}
                  />
                )}
              </View>

              {pendingCounterpart && (
                <Text className="text-sm text-destructive">
                  {`Registre primeiro a queda do dente de leite (${toothTypeLabel(pendingCounterpart)}) deste lado antes de registrar o nascimento do permanente.`}
                </Text>
              )}

              <View className="gap-3">
                <Text className="text-base text-base-500">Observação</Text>
                <Textarea
                  value={note}
                  onChangeText={setNote}
                  placeholder="Escreva uma observação (opcional)"
                  maxLength={500}
                  numberOfLines={3}
                  className="min-h-28 rounded-2xl bg-base-200/60 px-4 py-3"
                />
              </View>

              <Pressable
                onPress={handleConfirmPress}
                disabled={confirmDisabled}
                accessibilityRole="button"
                className={cn(
                  "h-14 w-full items-center justify-center rounded-full bg-primary-500 active:opacity-90",
                  confirmDisabled && "opacity-50",
                )}
              >
                <Text className="text-base font-bold text-base-100">
                  Confirmar
                </Text>
              </Pressable>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className={cn(
        "relative rounded-full px-5 py-2.5",
        selected ? "bg-primary-500" : "bg-base-200",
      )}
    >
      {selected ? (
        <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-base-100 shadow-sm shadow-base-400">
          <CheckIcon size={12} color={colors.primary500} weight="bold" />
        </View>
      ) : null}
      <Text
        className={cn(
          "text-base font-medium",
          selected ? "text-base-100" : "text-base-900",
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
