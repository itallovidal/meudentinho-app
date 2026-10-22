import { useContext, useState } from "react";
import { Alert } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteToothEvent } from "@/api/smile/deleteToothEvent";
import { updateToothEvent } from "@/api/smile/updateToothEvent";
import { resolveAccountId, toothEventsQueryKey } from "@/lib/queryKeys";
import { toothEventErrorMessage } from "@/lib/toothEventError";
import { UserContext } from "@/contexts/UserContext";
import type { ChronologyGender } from "@/lib/toothChronology";
import type { ToothEvent, ToothEventRequestDTO } from "@/types/teeth";

function lifecycleStage(event: ToothEvent): number {
  return (
    (event.dentition === "permanent" ? 2 : 0) +
    (event.eventType === "exfoliation" ? 1 : 0)
  );
}

function getDeleteDependents(
  event: ToothEvent | null,
  events: ToothEvent[],
): ToothEvent[] {
  if (!event) {
    return [];
  }
  return events.filter(
    (other) =>
      other.id !== event.id &&
      other.quadrant === event.quadrant &&
      other.toothType === event.toothType &&
      lifecycleStage(other) > lifecycleStage(event),
  );
}

export function useToothEventEditor({
  kidId,
  kidBirthDate,
  kidGender,
  authToken,
  events,
}: {
  kidId: string | null;
  kidBirthDate: string | null;
  kidGender: ChronologyGender | null;
  authToken: string | null | undefined;
  events: ToothEvent[];
}) {
  const queryClient = useQueryClient();
  const { userId } = useContext(UserContext)!;
  const accountId = resolveAccountId(userId, authToken);
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
        queryKey: toothEventsQueryKey(accountId, kidId),
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteToothEvent(id, authToken ?? ""),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: toothEventsQueryKey(accountId, kidId),
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
        toothEventErrorMessage(
          error,
          "Não foi possível salvar as alterações. Tente novamente.",
        ),
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
        toothEventErrorMessage(
          error,
          "Não foi possível excluir o registro. Tente novamente.",
        ),
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
      kidGender,
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
      confirmLabel: "Excluir",
      dependents: getDeleteDependents(deletingEvent, events),
      onConfirm: () => void handleConfirmDelete(),
      onCancel: () => setDeletingEvent(null),
    },
  };
}
