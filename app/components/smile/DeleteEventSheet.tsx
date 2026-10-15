import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { BottomSheet } from "@/components/ui/bottomSheet";
import { ToothEventCard } from "@/components/smile/ToothEventCard";
import type { ToothEvent } from "@/types/teeth";

type DeleteEventSheetProps = {
  open: boolean;
  title: string;
  confirmLabel: string;
  dependents: ToothEvent[];
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteEventSheet({
  open,
  title,
  confirmLabel,
  dependents,
  onConfirm,
  onCancel,
}: DeleteEventSheetProps) {
  return (
    <BottomSheet
      visible={open}
      onClose={onCancel}
      header={
        <Text className="text-xl font-bold text-base-900">{title}</Text>
      }
    >
      {dependents.length > 0 ? (
        <>
          <Text className="text-base text-base-500">
            Excluir esse registro, também removerá os registros:
          </Text>
          <View className="gap-2">
            {dependents.map((dependent) => (
              <ToothEventCard
                key={dependent.id}
                event={dependent}
                size="small"
                tone="muted"
              />
            ))}
          </View>
        </>
      ) : (
        <Text className="text-base text-base-500">
          O registro será removido do histórico.
        </Text>
      )}
      <Button
        variant="destructive"
        onPress={onConfirm}
        className="h-14 w-full rounded-full"
      >
        <Text className="text-base font-bold">{confirmLabel}</Text>
      </Button>
      <Button
        variant="outline"
        onPress={onCancel}
        className="h-14 w-full rounded-full"
      >
        <Text className="text-base font-bold">Cancelar</Text>
      </Button>
    </BottomSheet>
  );
}
