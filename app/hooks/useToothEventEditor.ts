import { useContext, useState } from "react";
import { Alert } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteToothEvent } from "@/api/smile/deleteToothEvent";
import { updateToothEvent } from "@/api/smile/updateToothEvent";
import { UserContext } from "@/contexts/UserContext";
import { toothEventTitle } from "@/lib/teethLabels";
import { ApiError } from "@/types/domain";
import type { ToothEvent, ToothEventRequestDTO } from "@/types/teeth";

function lifecycleStage(event: ToothEvent): number {
  return (
    (event.dentition === "permanent" ? 2 : 0) +
    (event.eventType === "exfoliation" ? 1 : 0)
  );
}

function getDeleteMessage(
  event: ToothEvent | null,
  events: ToothEvent[],
): string {
  if (!event) {
    return "O registro será removido do histórico.";
  }
  const dependents = events.filter(
    (other) =>
      other.id !== event.id &&
      other.quadrant === event.quadrant &&
      other.toothType === event.toothType &&
      lifecycleStage(other) > lifecycleStage(event),
  );
  if (dependents.length === 0) {
    return "O registro será removido do histórico.";
  }
  return `Também será removido: ${dependents.map(toothEventTitle).join(", ")}.`;
}

export function useToothEventEditor({
  kidId,
  kidBirthDate,
  authToken,
  events,
}: {
  kidId: string | null;
  kidBirthDate: string | null;
  authToken: string | null | undefined;
  events: ToothEvent[];
}) {
  const queryClient = useQueryClient();
  const { userId } = useContext(UserContext)!;
  const accountKey = userId ?? authToken ?? "";
  const [editingEvent, setEditingEvent] = useState<ToothEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<ToothEvent | null>(null);

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ToothEventRequestDTO;
    }) => updateToothEvent(id, authToken ?? "", payload),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["tooth-events", accountKey, kidId],
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteToothEvent(id, authToken ?? ""),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: ["tooth-events", accountKey, kidId],
      }),
  });

  const otherEvents = editingEvent
    ? events.filter((event) => event.id !== editingEvent.id)
    : events;
  const editingToothEvents = editingEvent
    ? otherEvents.filter(
        (event) =>
          event.quadrant === editingEvent.quadrant &&
          event.toothType === editingEvent.toothType,
      )
    : [];

  async function handleUpdate(payload: ToothEventRequestDTO) {
    if (!editingEvent) {
      return;
    }
    try {
      await updateMutation.mutateAsync({ id: editingEvent.id, payload });
      setEditingEvent(null);
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof ApiError
          ? error.message
          : "Não foi possível salvar as alterações. Tente novamente.",
      );
    }
  }

  async function handleConfirmDelete() {
    const target = deletingEvent;
    if (!target) {
      return;
    }
    setDeletingEvent(null);
    try {
      await deleteMutation.mutateAsync(target.id);
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof ApiError
          ? error.message
          : "Não foi possível excluir o registro. Tente novamente.",
      );
    }
  }

  return {
    openEditor: (event: ToothEvent) => setEditingEvent(event),
    modalProps: {
      visible: editingEvent !== null,
      toothId: editingEvent
        ? `${editingEvent.arch}_${editingEvent.side}_${editingEvent.toothType}`
        : null,
      kidId,
      kidBirthDate,
      toothEvents: editingToothEvents,
      events: otherEvents,
      editingEvent,
      onClose: () => setEditingEvent(null),
      onSubmit: handleUpdate,
      onDelete: () => {
        const target = editingEvent;
        setEditingEvent(null);
        setDeletingEvent(target);
      },
    },
    confirmProps: {
      open: deletingEvent !== null,
      title: "Excluir registro?",
      message: getDeleteMessage(deletingEvent, events),
      confirmLabel: "Excluir",
      destructive: true,
      onConfirm: () => void handleConfirmDelete(),
      onCancel: () => setDeletingEvent(null),
    },
  };
}
