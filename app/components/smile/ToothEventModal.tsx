import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  toothEventFormSchema,
  type ToothEventFormValues,
} from "@/lib/schemas/toothEventForm";
import { useEffect, useId, useRef, useState } from "react";
import { InfoPopover } from "@/components/infoPopover";
import { AnimatedCheckbox } from "@/components/forms/animatedCheckbox";
import { isToothEventDateUnknown } from "@/lib/toothIdentity";
import { Pressable, View } from "react-native";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { QueryWarningBanner } from "@/components/queryWarningBanner";
import { CalendarBlankIcon, CheckIcon, ClockIcon } from "phosphor-react-native";
import { DatePickerSheet } from "@/components/smile/datePickerSheet";
import { toothEventErrorMessage } from "@/lib/toothEventError";
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
  toothDentitionLabel,
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
  onSnooze,
  onRetry,
  actionsDisabledReason,
  initialDentition,
  initialDateUnknown = false,
  initialHistoryIncomplete = false,
}: {
  visible: boolean;
  toothId: string | null;
  kidId: string | null;
  kidBirthDate: string | null;
  kidGender: ChronologyGender | null;
  toothEvents: ToothEvent[];
  events: ToothEvent[];
  editingEvent?: ToothEvent | null;
  initialDentition?: Dentition;
  initialDateUnknown?: boolean;
  initialHistoryIncomplete?: boolean;
  onClose: () => void;
  onSubmit: (payload: ToothEventRequestDTO) => Promise<void>;
  onDelete?: () => void;
  onSnooze?: () => Promise<void>;
  onRetry?: () => void;
  actionsDisabledReason?: string | null;
}) {
  const form = useForm<ToothEventFormValues>({
    resolver: zodResolver(toothEventFormSchema),
    defaultValues: {
      eventType: "eruption",
      dentition: "primary",
      note: "",
      date: toLocalDateKey(new Date()),
      dateUnknown: false,
      historyIncomplete: false,
    },
  });
  const eventType = useWatch({ control: form.control, name: "eventType" });
  const dentition = useWatch({ control: form.control, name: "dentition" });
  const note = useWatch({ control: form.control, name: "note" });
  const date = useWatch({ control: form.control, name: "date" });
  const dateUnknown = useWatch({ control: form.control, name: "dateUnknown" });
  const historyIncomplete = useWatch({
    control: form.control,
    name: "historyIncomplete",
  });
  function setEventType(value: "eruption" | "exfoliation") {
    form.setValue("eventType", value);
  }
  function setDentition(value: Dentition) {
    form.setValue("dentition", value);
  }
  function setNote(value: string) {
    form.setValue("note", value);
  }
  function setDate(value: string) {
    form.setValue("date", value);
  }
  function setDateUnknown(value: boolean) {
    form.setValue("dateUnknown", value, {
      shouldDirty: true,
      shouldValidate: true,
    });
    if (value) setPickerOpen(false);
  }
  function setHistoryIncomplete(value: boolean) {
    form.setValue("historyIncomplete", value);
  }
  const submitError = form.formState.errors.root?.message;
  function setSubmitError(message: string | null) {
    if (message) form.setError("root", { message });
    else form.clearErrors("root");
  }
  const [pickerOpen, setPickerOpen] = useState(false);
  const deleteRequestedRef = useRef(false);
  const popoverHost = useId();
  const modalKey = `${visible}|${toothId}|${editingEvent?.id ?? ""}|${initialDentition ?? ""}|${initialDateUnknown}|${initialHistoryIncomplete}`;
  const prevModalKey = useRef<string | null>(null);

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

  useEffect(() => {
    if (modalKey === prevModalKey.current) return;
    prevModalKey.current = modalKey;
    if (!visible) return;
    const fallbackEventType = initialDentition ? "eruption" : initialEventType;
    form.reset({
      eventType: editingEvent?.eventType ?? fallbackEventType,
      dentition:
        editingEvent?.dentition ??
        initialDentition ??
        (fallbackEventType === "exfoliation"
          ? exfoliationDentition
          : defaultDentition),
      note: editingEvent?.note ?? "",
      date:
        editingEvent && !isToothEventDateUnknown(editingEvent)
          ? eventDateKey(editingEvent.occurrenceDate)
          : toLocalDateKey(new Date()),
      dateUnknown:
        (!!editingEvent && isToothEventDateUnknown(editingEvent)) ||
        (!editingEvent && initialDateUnknown),
      historyIncomplete:
        editingEvent?.historyIncomplete ?? initialHistoryIncomplete,
    });
  }, [
    modalKey,
    visible,
    form,
    initialDentition,
    initialEventType,
    editingEvent,
    initialDateUnknown,
    initialHistoryIncomplete,
    exfoliationDentition,
    defaultDentition,
  ]);

  function changeEventType(next: "eruption" | "exfoliation") {
    setEventType(next);
    setHistoryIncomplete(false);
    const nextDentition =
      next === "exfoliation" ? exfoliationDentition : defaultDentition;
    if (editingEvent) {
      setDentition(nextDentition);
      return;
    }
    resetForm(nextDentition);
  }

  const dateError = dateUnknown
    ? null
    : validateEventDateKey(date, kidBirthDate);
  const [isSaving, setIsSaving] = useState(false);
  const [isSnoozing, setIsSnoozing] = useState(false);
  const actionPendingRef = useRef(false);
  const isBusy = isSaving || isSnoozing;

  async function performSave() {
    if (
      !parsed ||
      !kidId ||
      actionPendingRef.current ||
      actionsDisabledReason ||
      dateError
    ) {
      return;
    }
    actionPendingRef.current = true;
    try {
      if (!(await form.trigger())) {
        return;
      }
      const occurrenceDate = dateUnknown ? "" : localDateKeyToISO(date);
      if (occurrenceDate === null) {
        return;
      }
      setIsSaving(true);
      setSubmitError(null);
      await onSubmit({
        kidId,
        occurrenceDate,
        recordKind: dateUnknown ? "undated" : "dated",
        historyIncomplete:
          eventType === "eruption" &&
          dentition === "permanent" &&
          historyIncomplete,
        dentition:
          editingEvent?.dentition ?? (milkAllowed ? dentition : "permanent"),
        arch: parsed.arch,
        side: parsed.side,
        toothType: parsed.toothType,
        eventType,
        quadrant: parsed.quadrant,
        note: note.trim() ? note.trim() : undefined,
      });
    } catch (error) {
      setSubmitError(
        toothEventErrorMessage(
          error,
          "Não foi possível salvar o registro. Tente novamente.",
        ),
      );
    } finally {
      actionPendingRef.current = false;
      setIsSaving(false);
    }
  }

  function handleConfirmPress() {
    void performSave();
  }

  async function performSnooze(dismiss: () => void) {
    if (!onSnooze || actionPendingRef.current || actionsDisabledReason) {
      return;
    }
    actionPendingRef.current = true;
    setIsSnoozing(true);
    setSubmitError(null);
    const requestKey = modalKey;
    try {
      await onSnooze();
      if (prevModalKey.current === requestKey) dismiss();
    } catch (error) {
      if (prevModalKey.current === requestKey) {
        setSubmitError(
          toothEventErrorMessage(
            error,
            "Não foi possível adiar o aviso. Tente novamente.",
          ),
        );
      }
    } finally {
      actionPendingRef.current = false;
      setIsSnoozing(false);
    }
  }

  const alreadyRegistered = toothEvents.some(
    (event) => event.eventType === eventType && event.dentition === dentition,
  );

  const editChanged = editingEvent
    ? dateUnknown !== isToothEventDateUnknown(editingEvent) ||
      historyIncomplete !== !!editingEvent.historyIncomplete ||
      eventType !== editingEvent.eventType ||
      dentition !== editingEvent.dentition ||
      (!dateUnknown && date !== eventDateKey(editingEvent.occurrenceDate)) ||
      note.trim() !== (editingEvent.note ?? "").trim()
    : true;

  const confirmDisabled =
    !!actionsDisabledReason ||
    !parsed ||
    alreadyRegistered ||
    !!dateError ||
    (!editingEvent &&
      eventType === "eruption" &&
      milkStepPending !== null &&
      !dateUnknown &&
      !historyIncomplete &&
      dentition === "permanent") ||
    (editingEvent !== null && !editChanged);

  const confirmDisabledReason =
    actionsDisabledReason ??
    (!parsed
      ? "Não foi possível identificar este dente."
      : alreadyRegistered
        ? "Este evento já está registrado para o dente."
        : dateError
          ? dateError
          : !editingEvent &&
              eventType === "eruption" &&
              milkStepPending !== null &&
              !dateUnknown &&
              !historyIncomplete &&
              dentition === "permanent"
            ? "Registre primeiro o dente de leite deste local."
            : editingEvent !== null && !editChanged
              ? "Altere a data ou a observação para salvar."
              : null);

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
            {parsed
              ? `${toothDentitionLabel(parsed.toothType, dentition)} · ${parsed.arch === "upper" ? "Superior" : "Inferior"} ${parsed.side === "right" ? "Direito" : "Esquerdo"}`
              : toothIdLabel(toothId)}
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
              <Text className="text-sm text-muted-foreground">
                {`${toothEventVerb(editingEvent.eventType)} (${dentitionLabel(editingEvent.dentition).toLowerCase()})`}
              </Text>
            </View>
          )}
        </View>
      }
    >
      {(dismiss) => (
        <>
          {actionsDisabledReason &&
            (onRetry ? (
              <QueryWarningBanner
                message={actionsDisabledReason}
                onRetry={onRetry}
              />
            ) : (
              <Text accessibilityRole="alert" className="text-destructive">
                {actionsDisabledReason}
              </Text>
            ))}
          {!editingEvent && !initialDentition && (
            <>
              <View className="gap-3">
                <Text className="text-base text-muted-foreground">
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
                <Text className="text-base text-muted-foreground">Dentição</Text>
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
                        : milkStepPending !== null &&
                          !dateUnknown &&
                          !historyIncomplete
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

          {initialDentition && (
            <Text className="text-base font-bold text-primary-800">
              {dentitionLabel(initialDentition)} · Nascimento
            </Text>
          )}
          {!editingEvent &&
            dentition === "permanent" &&
            eventType === "eruption" &&
            milkStepPending !== null && (
              <View className="flex-row items-start gap-3 rounded-xl border border-base-200 bg-base-100 p-4">
                <AnimatedCheckbox
                  checked={historyIncomplete}
                  onChange={setHistoryIncomplete}
                  accessibilityLabel="Não tenho o histórico anterior de leite"
                />
                <Pressable
                  onPress={() => setHistoryIncomplete(!historyIncomplete)}
                  className="flex-1 gap-1"
                >
                  <Text className="text-base-600">
                    Não tenho o histórico anterior de leite
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    Registrar este nascimento sem inventar as datas anteriores.
                  </Text>
                </Pressable>
              </View>
            )}
          <View className="gap-3">
            <Text className="text-base text-muted-foreground">
              Data do acontecimento
            </Text>
            <View className="flex-row items-center gap-2">
              <Input
                editable={false}
                value={dateUnknown ? "" : (formatDatePtBR(date) ?? date)}
                placeholder={dateUnknown ? "Data não informada" : undefined}
                accessibilityLabel="Data do acontecimento"
                accessibilityState={{ disabled: dateUnknown }}
                className={cn("flex-1", dateUnknown && "opacity-50")}
              />
              <Pressable
                onPress={() => setPickerOpen(true)}
                disabled={dateUnknown}
                accessibilityRole="button"
                accessibilityLabel="Abrir calendário"
                accessibilityState={{ disabled: dateUnknown }}
                className={cn(
                  "h-14 w-14 items-center justify-center rounded-md bg-primary-500",
                  dateUnknown && "opacity-50",
                )}
              >
                <CalendarBlankIcon
                  size={22}
                  color={colors.base200}
                  weight="regular"
                />
              </Pressable>
            </View>
            <View className="flex-row items-center gap-3">
              <AnimatedCheckbox
                checked={dateUnknown}
                onChange={setDateUnknown}
                accessibilityLabel="Não sei informar"
              />
              <Pressable
                onPress={() => setDateUnknown(!dateUnknown)}
                hitSlop={4}
                className="flex-1"
              >
                <Text className="text-sm text-muted-foreground">Não sei informar</Text>
              </Pressable>
            </View>
            {dateError ? (
              <Text className="text-destructive" variant="small">
                {dateError}
              </Text>
            ) : null}
          </View>
          <View className="gap-3">
            <Text className="text-base text-muted-foreground">Observação</Text>
            <Textarea
              value={note}
              onChangeText={setNote}
              placeholder="Escreva uma observação (opcional)"
              maxLength={500}
              numberOfLines={3}
              className="min-h-28 rounded-2xl bg-base-200/60 px-4 py-3"
            />
          </View>

          {submitError && (
            <Text accessibilityRole="alert" className="text-destructive">
              {submitError}
            </Text>
          )}
          <View className="relative">
            <Pressable
              onPress={handleConfirmPress}
              disabled={confirmDisabled || isBusy}
              accessibilityRole="button"
              accessibilityHint={confirmDisabledReason ?? undefined}
              className={cn(
                "h-14 w-full items-center justify-center rounded-full bg-primary-500 active:opacity-90",
                (confirmDisabled || isBusy) && "opacity-50",
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
            {(confirmDisabled || isBusy) && confirmDisabledReason ? (
              <View className="absolute -right-1 -top-1 z-10 h-6 w-6 items-center justify-center rounded-full bg-base-100 shadow-sm shadow-base-400">
                <InfoPopover
                  accessibilityLabel="Por que não posso salvar?"
                  message={confirmDisabledReason}
                  portalHost={popoverHost}
                  iconSize={20}
                />
              </View>
            ) : null}
          </View>

          {!editingEvent && (onSnooze || isSnoozing) && (
            <Button
              variant="ghost"
              disabled={isBusy || !!actionsDisabledReason}
              onPress={() => void performSnooze(dismiss)}
              accessibilityLabel="Adiar por 7 dias"
              accessibilityState={{
                disabled: isBusy || !!actionsDisabledReason,
                busy: isSnoozing,
              }}
              className="min-h-12 w-full gap-2 rounded-full"
            >
              <ClockIcon size={18} color={colors.primary400} />
              <Text className="text-sm font-semibold text-primary">
                {isSnoozing ? "Adiando..." : "Adiar por 7 dias"}
              </Text>
            </Button>
          )}

          {editingEvent && onDelete && (
            <Pressable
              onPress={() => {
                deleteRequestedRef.current = true;
                dismiss();
              }}
              accessibilityRole="button"
              className="h-14 w-full items-center justify-center rounded-full active:opacity-90"
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
        <View className="absolute -right-1 -top-1 z-10 h-6 w-6 items-center justify-center rounded-full bg-base-100 shadow-sm shadow-base-400">
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
