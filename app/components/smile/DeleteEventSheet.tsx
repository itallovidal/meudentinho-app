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
  errorMessage?: string | null;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteEventSheet({
  open,
  title,
  confirmLabel,
  dependents,
  errorMessage,
  pending = false,
  onConfirm,
  onCancel,
}: DeleteEventSheetProps) {
  return (
    <BottomSheet
      visible={open}
      onClose={onCancel}
      header={<Text className="text-xl font-bold text-base-900">{title}</Text>}
    >
      {(dismiss) => (
        <>
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
          {errorMessage && (
            <Text accessibilityRole="alert" className="text-destructive">
              {errorMessage}
            </Text>
          )}
          <Button
            disabled={pending}
            variant="destructive"
            onPress={onConfirm}
            className="h-14 w-full rounded-full"
          >
            <Text className="text-base font-bold">
              {pending ? "Excluindo..." : confirmLabel}
            </Text>
          </Button>
          <Button
            variant="outline"
            disabled={pending}
            onPress={dismiss}
            className="h-14 w-full rounded-full"
          >
            <Text className="text-base font-bold">Cancelar</Text>
          </Button>
        </>
      )}
    </BottomSheet>
  );
}
