import React, { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Wrapper } from "@/components/wrapper";
import { Text } from "@/components/ui/text";
import { CustomCalendar } from "@/components/calendar";
import { CalendarBlankIcon } from "phosphor-react-native";
import {
  ageInMonths,
  formatDatePtBR,
  localDateKeyToISO,
  toLocalDateKey,
} from "@/lib/utils";
import { expectedDentition } from "@/lib/toothChronology";
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

export default function ToothEventModal({
  visible,
  toothId,
  kidId,
  kidBirthDate,
  toothEvents,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  toothId: string | null;
  kidId: string | null;
  kidBirthDate: string | null;
  toothEvents: ToothEvent[];
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
    setEventType("eruption");
    loadRecord(
      toothEvents.find((event) => event.eventType === "eruption"),
      defaultDentition,
    );
  }, [toothId]);

  function changeEventType(next: "eruption" | "exfoliation") {
    setEventType(next);
    loadRecord(
      toothEvents.find((event) => event.eventType === next),
      defaultDentition,
    );
  }

  async function handleSave() {
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

  const editingRecord = editingId
    ? toothEvents.find((event) => event.id === editingId)
    : undefined;

  return (
    <Dialog
      open={visible}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="gap-4 p-5">
        <DialogHeader>
          <DialogTitle>{toothIdLabel(toothId)}</DialogTitle>
          {editingRecord && (
            <DialogDescription>
              {`Editando registro de ${formatDatePtBR(editingRecord.occurrenceDate) ?? ""}`}
            </DialogDescription>
          )}
        </DialogHeader>

        <Wrapper direction="column" gap="gap-2">
          <Text className="font-bold">O que aconteceu?</Text>
          <Wrapper className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => changeEventType("eruption")}
              className={`rounded-full px-3 py-2 ${eventType === "eruption" ? "bg-primary-200" : "bg-base-200"}`}
            >
              <Text>{toothEventVerb("eruption")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => changeEventType("exfoliation")}
              className={`rounded-full px-3 py-2 ${eventType === "exfoliation" ? "bg-primary-200" : "bg-base-200"}`}
            >
              <Text>{toothEventVerb("exfoliation")}</Text>
            </TouchableOpacity>
          </Wrapper>
        </Wrapper>

        <Wrapper direction="column" gap="gap-2">
          <Text className="font-bold">Dentição</Text>
          <Wrapper className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setDentition("primary")}
              className={`rounded-full px-3 py-2 ${dentition === "primary" ? "bg-primary-200" : "bg-base-200"}`}
            >
              <Text>{dentitionLabel("primary")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setDentition("permanent")}
              className={`rounded-full px-3 py-2 ${dentition === "permanent" ? "bg-primary-200" : "bg-base-200"}`}
            >
              <Text>{dentitionLabel("permanent")}</Text>
            </TouchableOpacity>
          </Wrapper>
        </Wrapper>

        <Wrapper direction="column" gap="gap-2">
          <Text className="font-bold">Data do acontecimento</Text>
          <Wrapper direction="row" align="center" gap="gap-2">
            <Input
              editable={false}
              value={formatDatePtBR(date) ?? date}
              className="flex-1 bg-base-100"
            />
            <TouchableOpacity
              onPress={() => setShowCalendar((current) => !current)}
              className="rounded bg-base-200 p-2.5"
            >
              <CalendarBlankIcon size={20} weight="bold" />
            </TouchableOpacity>
          </Wrapper>
          {showCalendar && (
            <CustomCalendar
              onDayPress={(day) => {
                setDate(day.dateString);
                setShowCalendar(false);
              }}
              markedDates={{
                [date]: {
                  selected: true,
                  selectedColor: "#1E3A5F",
                  selectedTextColor: "#FFFFFF",
                },
              }}
            />
          )}
        </Wrapper>

        <Textarea
          value={note}
          onChangeText={setNote}
          placeholder="Observação (opcional)"
          maxLength={500}
          numberOfLines={3}
          className="bg-base-100"
        />

        <Wrapper className="mt-2 flex-row gap-2">
          <TouchableOpacity
            onPress={onClose}
            className="rounded bg-base-200 px-4 py-2"
          >
            <Text>Fechar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => void handleSave()}
            disabled={!parsed}
            className="rounded bg-primary-700 px-4 py-2"
          >
            <Text className="text-white">Confirmar</Text>
          </TouchableOpacity>
        </Wrapper>
      </DialogContent>
    </Dialog>
  );
}
