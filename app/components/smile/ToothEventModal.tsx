import { useId, useRef, useState } from "react";
import { InfoPopover } from "@/components/infoPopover";
import { Pressable, View } from "react-native";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { CalendarBlankIcon, CheckIcon } from "phosphor-react-native";
import { DatePickerSheet } from "@/components/smile/datePickerSheet";
import { THEME } from "@/lib/theme";
import { ToothSVG } from "@/components/smile/teeth/ToothSVG";
import {
  LEGEND_TOOTH,
  MILK_SYMBOL_DASH,
  TOOTH_STYLE,
  isMilkSymbol,
} from "@/components/smile/teeth/toothStyle";
import { eventToothState } from "@/components/smile/ToothEventCard";
import { BottomSheet } from "@/components/ui/bottomSheet";
import {
  ageInMonths,
  cn,
  eventDateKey,
  formatDatePtBR,
  localDateKeyToISO,
  toLocalDateKey,
  validateEventDateKey,
} from "@/lib/utils";
import {
  expectedDentition,
  hasDeciduousForm,
  pendingMilkStep,
  type ChronologyGender,
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
  kidGender,
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
  kidGender: ChronologyGender | null;
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
  const [pickerOpen, setPickerOpen] = useState(false);
  const deleteRequestedRef = useRef(false);
  const popoverHost = useId();
  const modalKey = `${visible}|${toothId}|${editingEvent?.id ?? ""}`;
  const [prevModalKey, setPrevModalKey] = useState<string | null>(null);

  const parsed = parseToothId(toothId);
  const milkAllowed =
    parsed !== null && hasDeciduousForm(parsed.arch, parsed.toothType);
  const ageMonths = kidBirthDate !== null ? ageInMonths(kidBirthDate) : null;
  const milkStepPending =
    parsed !== null && milkAllowed
      ? pendingMilkStep(parsed.arch, parsed.quadrant, parsed.toothType, events)
      : null;
  const milkFell =
    milkAllowed &&
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
    milkAllowed &&
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
  const exfoliationDentition: Dentition =
    !milkAllowed || permanentErupted ? "permanent" : "primary";
  const defaultDentition =
    !milkAllowed || lockedToPermanent
      ? "permanent"
      : parsed !== null && milkStepPending === null
        ? expectedDentition(
            parsed.toothType,
            parsed.arch,
            ageMonths,
            parsed.side,
            kidGender,
          )
        : "primary";
  const initialEventType: "eruption" | "exfoliation" = exfoliationOnlyLeft
    ? "exfoliation"
    : "eruption";

  function resetForm(fallbackDentition: Dentition) {
    setDentition(fallbackDentition);
    setNote("");
    setDate(toLocalDateKey(new Date()));
  }

  if (modalKey !== prevModalKey) {
    setPrevModalKey(modalKey);
    if (visible) {
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
        setDate(eventDateKey(editingEvent.occurrenceDate));
      }
    }
  }

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

  const dateError = validateEventDateKey(date, kidBirthDate);
  const [isSaving, setIsSaving] = useState(false);

  async function performSave() {
    if (!parsed || !kidId || isSaving) {
      return;
    }
    if (dateError) {
      return;
    }
    const occurrenceDate = localDateKeyToISO(date);
    if (!occurrenceDate) {
      return;
    }
    setIsSaving(true);
    try {
      await onSubmit({
        kidId,
        occurrenceDate,
        dentition:
          editingEvent?.dentition ?? (milkAllowed ? dentition : "permanent"),
        arch: parsed.arch,
        side: parsed.side,
        toothType: parsed.toothType,
        eventType,
        quadrant: parsed.quadrant,
        note: note.trim() ? note.trim() : undefined,
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleConfirmPress() {
    void performSave();
  }

  const alreadyRegistered = toothEvents.some(
    (event) => event.eventType === eventType && event.dentition === dentition,
  );

  const editChanged = editingEvent
    ? eventType !== editingEvent.eventType ||
      dentition !== editingEvent.dentition ||
      date !== eventDateKey(editingEvent.occurrenceDate) ||
      note.trim() !== (editingEvent.note ?? "").trim()
    : true;

  const confirmDisabled =
    !parsed ||
    alreadyRegistered ||
    !!dateError ||
    (!editingEvent &&
      eventType === "eruption" &&
      milkStepPending !== null &&
      dentition === "permanent") ||
    (editingEvent !== null && !editChanged);

  const confirmDisabledReason = !parsed
    ? "Não foi possível identificar este dente."
    : alreadyRegistered
      ? "Este evento já está registrado para o dente."
      : dateError
        ? dateError
        : !editingEvent &&
            eventType === "eruption" &&
            milkStepPending !== null &&
            dentition === "permanent"
          ? "Registre primeiro o dente de leite deste local."
          : editingEvent !== null && !editChanged
            ? "Altere a data ou a observação para salvar."
            : null;

  const editingState = editingEvent ? eventToothState(editingEvent) : null;

  return (
    <BottomSheet
      visible={visible}
      portalHostName={popoverHost}
      onClose={() => {
        onClose();
        if (deleteRequestedRef.current) {
          deleteRequestedRef.current = false;
          onDelete?.();
        }
      }}
      header={
        <View className="flex-1">
          <Text className="text-xl font-bold text-base-900">
            {toothIdLabel(toothId)}
          </Text>
          {editingEvent && editingState && (
            <View className="mt-1 flex-row items-center gap-2">
              <ToothSVG
                viewBox={LEGEND_TOOTH.viewBox}
                contour={LEGEND_TOOTH.contour}
                details={LEGEND_TOOTH.details}
                fill={TOOTH_STYLE[editingState].fill}
                stroke={TOOTH_STYLE[editingState].stroke}
                strokeDasharray={
                  isMilkSymbol(editingState) ? MILK_SYMBOL_DASH : undefined
                }
                width={20}
                height={20}
              />
              <Text className="text-sm text-base-500">
                {`${toothEventVerb(editingEvent.eventType)} (${dentitionLabel(editingEvent.dentition).toLowerCase()})`}
              </Text>
            </View>
          )}
        </View>
      }
    >
      {(dismiss) => (
        <>
          {!editingEvent && (
            <>
              <View className="gap-3">
                <Text className="text-base text-base-500">
                  O que aconteceu?
                </Text>
                <View className="flex-row flex-wrap gap-3">
                  <Chip
                    portalHost={popoverHost}
                    label={toothEventVerb("eruption")}
                    selected={eventType === "eruption"}
                    disabled={exfoliationOnlyLeft}
                    disabledReason={
                      !milkAllowed
                        ? "O nascimento permanente deste dente já foi registrado."
                        : "Este dente já nasceu; registre a queda antes de uma nova erupção."
                    }
                    onPress={() => changeEventType("eruption")}
                  />
                  <Chip
                    portalHost={popoverHost}
                    label={toothEventVerb("exfoliation")}
                    selected={eventType === "exfoliation"}
                    disabled={
                      !(milkEruptionRecorded || permanentErupted) ||
                      lockedToPermanent
                    }
                    disabledReason={
                      lockedToPermanent
                        ? "A dentição de leite já caiu; registre a erupção permanente."
                        : "Registre a erupção do dente antes da queda."
                    }
                    onPress={() => changeEventType("exfoliation")}
                  />
                </View>
              </View>

              <View className="gap-3">
                <Text className="text-base text-base-500">Dentição</Text>
                <View className="flex-row flex-wrap gap-3">
                  <Chip
                    portalHost={popoverHost}
                    label={dentitionLabel("primary")}
                    selected={dentition === "primary"}
                    disabled={
                      !milkAllowed || lockedToPermanent || permanentErupted
                    }
                    disabledReason={
                      !milkAllowed
                        ? "Este dente permite apenas registros permanentes."
                        : "O ciclo já avançou para a dentição permanente."
                    }
                    onPress={() => setDentition("primary")}
                  />
                  <Chip
                    portalHost={popoverHost}
                    label={dentitionLabel("permanent")}
                    selected={dentition === "permanent"}
                    disabled={
                      eventType === "exfoliation"
                        ? !permanentErupted
                        : !editingEvent && milkStepPending !== null
                    }
                    disabledReason={
                      eventType === "exfoliation" && !permanentErupted
                        ? "Registre a erupção permanente antes da queda."
                        : !editingEvent && milkStepPending !== null
                          ? "Registre primeiro a erupção e a queda do dente de leite."
                          : undefined
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
                onPress={() => setPickerOpen(true)}
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
            {dateError ? (
              <Text className="text-destructive" variant="small">
                {dateError}
              </Text>
            ) : null}
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

          <View className="relative">
            <Pressable
              onPress={handleConfirmPress}
              disabled={confirmDisabled || isSaving}
              accessibilityRole="button"
              accessibilityHint={confirmDisabledReason ?? undefined}
              className={cn(
                "h-14 w-full items-center justify-center rounded-full bg-primary-500 active:opacity-90",
                (confirmDisabled || isSaving) && "opacity-50",
              )}
            >
              <Text className="text-base font-bold text-base-100">
                {isSaving
                  ? "Salvando..."
                  : editingEvent
                    ? "Salvar alterações"
                    : "Confirmar"}
              </Text>
            </Pressable>
            {(confirmDisabled || isSaving) && confirmDisabledReason ? (
              <View className="absolute -right-1 -top-1 z-10 rounded-full bg-base-100 shadow-sm shadow-base-400">
                <InfoPopover
                  accessibilityLabel="Por que não posso salvar?"
                  message={confirmDisabledReason}
                  portalHost={popoverHost}
                  iconSize={20}
                />
              </View>
            ) : null}
          </View>

          {editingEvent && onDelete && (
            <Pressable
              onPress={() => {
                deleteRequestedRef.current = true;
                dismiss();
              }}
              accessibilityRole="button"
              className="h-14 w-full items-center justify-center rounded-full active:opacity-70"
            >
              <Text className="text-base font-bold text-destructive">
                Excluir registro
              </Text>
            </Pressable>
          )}

          <DatePickerSheet
            visible={pickerOpen}
            value={date}
            minDate={kidBirthDate ? eventDateKey(kidBirthDate) : undefined}
            maxDate={toLocalDateKey(new Date())}
            onConfirm={(dateKey) => {
              setDate(dateKey);
              setPickerOpen(false);
            }}
            onCancel={() => setPickerOpen(false)}
          />
        </>
      )}
    </BottomSheet>
  );
}

function Chip({
  label,
  selected,
  disabled = false,
  disabledReason,
  portalHost,
  onPress,
}: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  disabledReason?: string;
  portalHost: string;
  onPress: () => void;
}) {
  return (
    <View className="relative">
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="radio"
        accessibilityState={{ selected, disabled }}
        accessibilityHint={disabled ? disabledReason : undefined}
        className={cn(
          "relative rounded-full px-5 py-2.5",
          selected ? "bg-primary-500" : "bg-base-200",
          disabled && "opacity-50",
        )}
      >
        {selected && !disabled ? (
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
      {disabled && disabledReason ? (
        <View className="absolute -right-1 -top-1 z-10 rounded-full bg-base-100 shadow-sm shadow-base-400">
          <InfoPopover
            accessibilityLabel={`Por que "${label}" está indisponível?`}
            message={disabledReason}
            portalHost={portalHost}
            iconSize={20}
          />
        </View>
      ) : null}
    </View>
  );
}
