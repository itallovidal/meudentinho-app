import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Wrapper } from "@/components/wrapper";
import { Text } from "@/components/ui/text";
import { ToothEvent } from "@/types/teeth";

export default function ToothEventModal({
  visible,
  toothId,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  toothId: string | null;
  onClose: () => void;
  onSubmit: (payload: Omit<ToothEvent, "id">) => Promise<void>;
}) {
  const [date] = useState(new Date());
  const [eventType, setEventType] = useState<"eruption" | "exfoliation">(
    "eruption",
  );

  return (
    <Dialog
      open={visible}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="gap-4 p-5">
        <DialogHeader>
          <DialogTitle>Registrar Evento</DialogTitle>
          <DialogDescription>
            Dente: {toothId ?? "não selecionado"}
          </DialogDescription>
        </DialogHeader>

        <Wrapper className="mt-2 flex-row gap-2">
          <TouchableOpacity
            onPress={() => setEventType("eruption")}
            className={`rounded px-3 py-2 ${eventType === "eruption" ? "bg-primary-200" : "bg-base-200"}`}
          >
            <Text>Erupção</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setEventType("exfoliation")}
            className={`rounded px-3 py-2 ${eventType === "exfoliation" ? "bg-primary-200" : "bg-base-200"}`}
          >
            <Text>Exfoliação</Text>
          </TouchableOpacity>
        </Wrapper>

        <Wrapper className="mt-2">
          <Text>Data: {date.toLocaleDateString()}</Text>
        </Wrapper>

        <Wrapper className="mt-2 flex-row gap-2">
          <TouchableOpacity
            onPress={onClose}
            className="rounded bg-base-200 px-4 py-2"
          >
            <Text>Fechar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (!toothId) return;
              onSubmit({
                occurrenceDate: date.toISOString(),
                dentition: "permanent",
                arch: "upper",
                side: "left",
                toothType: "central_incisor",
                eventType,
              });
            }}
            className="rounded bg-primary-700 px-4 py-2"
          >
            <Text className="text-white">Salvar</Text>
          </TouchableOpacity>
        </Wrapper>
      </DialogContent>
    </Dialog>
  );
}
