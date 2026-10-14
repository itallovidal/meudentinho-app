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
import {
  expectedDentition,
  hasDeciduousForm,
  pendingMilkStep,
} from "@/lib/toothChronology";
import {
  dentitionLabel,
  parseToothId,
  toothEventVerb,
  toothIdLabel,
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
  editingEvent = null,
  onClose,
  onSubmit,
  onDelete,
}: {
  visible: boolean;
  toothId: string | null;
  kidId: string | null;
  kidBirthDate: string | null;
  toothEvents: ToothEvent[];
  events: ToothEvent[];
  editingEvent?: ToothEvent | null;
  onClose: () => void;
  onSubmit: (payload: ToothEventRequestDTO) => Promise<void>;
  onDelete?: () => void;
}) {
  const [eventType, setEventType] = useState<"eruption" | "exfoliation">(
    "eruption",
  );
  const [dentition, setDentition] = useState<Dentition>("primary");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => toLocalDateKey(new Date()));
  const [showCalendar, setShowCalendar] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const parsed = parseToothId(toothId);
  const ageMonths = kidBirthDate !== null ? ageInMonths(kidBirthDate) : null;
  const milkStepPending =
    parsed !== null
      ? pendingMilkStep(parsed.arch, parsed.quadrant, parsed.toothType, events)
      : null;
  const milkFell =
    parsed !== null &&
    events.some(
      (event) =>
        event.quadrant === parsed.quadrant &&
        event.toothType === parsed.toothType &&
        event.dentition === "primary" &&
        event.eventType === "exfoliation",
    );
  const permanentErupted =
    parsed !== null &&
    events.some(
      (event) =>
        event.quadrant === parsed.quadrant &&
        event.toothType === parsed.toothType &&
        event.dentition === "permanent" &&
        event.eventType === "eruption",
    );
  const milkEruptionRecorded =
    parsed !== null &&
    events.some(
      (event) =>
        event.quadrant === parsed.quadrant &&
        event.toothType === parsed.toothType &&
        event.dentition === "primary" &&
        event.eventType === "eruption",
    );
  const lockedToPermanent = milkFell && !permanentErupted;
  const exfoliationOnlyLeft =
    (milkEruptionRecorded && !milkFell) || permanentErupted;
  const initialEventType: "eruption" | "exfoliation" = exfoliationOnlyLeft
    ? "exfoliation"
    : "eruption";
  const exfoliationDentition: Dentition = permanentErupted
    ? "permanent"
    : "primary";
  const defaultDentition = lockedToPermanent
    ? "permanent"
    : parsed !== null && milkStepPending === null
      ? expectedDentition(parsed.toothType, parsed.arch, ageMonths)
      : "primary";

  function resetForm(fallbackDentition: Dentition) {
    setDentition(fallbackDentition);
    setNote("");
    setDate(toLocalDateKey(new Date()));
    setShowCalendar(false);
  }

  useEffect(() => {
    if (!visible) {
      return;
    }
    setEventType(initialEventType);
    resetForm(
      initialEventType === "exfoliation"
        ? exfoliationDentition
        : defaultDentition,
    );
    if (editingEvent) {
      setEventType(editingEvent.eventType);
      setDentition(editingEvent.dentition);
      setNote(editingEvent.note ?? "");
      setDate(toLocalDateKey(new Date(editingEvent.occurrenceDate)));
    }
  }, [visible, toothId, editingEvent]);

  function changeEventType(next: "eruption" | "exfoliation") {
    setEventType(next);
    const nextDentition =
      next === "exfoliation" ? exfoliationDentition : defaultDentition;
    if (editingEvent) {
      setDentition(nextDentition);
      return;
    }
    resetForm(nextDentition);
  }

  async function performSave() {
    if (!parsed || !kidId) {
      return;
    }
    const occurrenceDate = localDateKeyToISO(date);
    if (!occurrenceDate) {
      return;
    }
    await onSubmit({
      kidId,
      occurrenceDate,
      dentition,
      arch: parsed.arch,
      side: parsed.side,
      toothType: parsed.toothType,
      eventType,
      quadrant: parsed.quadrant,
      note: note.trim() ? note.trim() : undefined,
    });
  }

  function handleConfirmPress() {
    void performSave();
  }

  const milkAllowed =
    parsed !== null && hasDeciduousForm(parsed.arch, parsed.toothType);

  const alreadyRegistered = toothEvents.some(
    (event) => event.eventType === eventType && event.dentition === dentition,
  );

  const confirmDisabled =
    !parsed ||
    alreadyRegistered ||
    (eventType === "eruption" &&
      milkStepPending !== null &&
      dentition === "permanent");

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
                  {editingEvent && (
                    <Text className="text-sm text-base-500">
                      {`Dentição: ${dentitionLabel(editingEvent.dentition)}`}
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

              {!editingEvent && (
                <>
                  <View className="gap-3">
                    <Text className="text-base text-base-500">
                      O que aconteceu?
                    </Text>
                    <View className="flex-row gap-3">
                      <Chip
                        label={toothEventVerb("eruption")}
                        selected={eventType === "eruption"}
                        disabled={exfoliationOnlyLeft}
                        onPress={() => changeEventType("eruption")}
                      />
                      <Chip
                        label={toothEventVerb("exfoliation")}
                        selected={eventType === "exfoliation"}
                        disabled={
                          !(milkEruptionRecorded || permanentErupted) ||
                          lockedToPermanent
                        }
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
                        disabled={
                          !milkAllowed || lockedToPermanent || permanentErupted
                        }
                        onPress={() => setDentition("primary")}
                      />
                      <Chip
                        label={dentitionLabel("permanent")}
                        selected={dentition === "permanent"}
                        disabled={
                          eventType === "exfoliation"
                            ? !permanentErupted
                            : milkStepPending !== null
                        }
                        onPress={() => setDentition("permanent")}
                      />
                    </View>
                  </View>
                </>
              )}

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
                    <CalendarBlankIcon
                      size={22}
                      color={colors.base600}
                      weight="regular"
                    />
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
                  {editingEvent ? "Salvar alterações" : "Confirmar"}
                </Text>
              </Pressable>

              {editingEvent && onDelete && (
                <Pressable
                  onPress={onDelete}
                  accessibilityRole="button"
                  className="h-14 w-full items-center justify-center rounded-full active:opacity-70"
                >
                  <Text className="text-base font-bold text-destructive">
                    Excluir registro
                  </Text>
                </Pressable>
              )}
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
  disabled = false,
  onPress,
}: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      className={cn(
        "relative rounded-full px-5 py-2.5",
        selected ? "bg-primary-500" : "bg-base-200",
        disabled && "opacity-50",
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
