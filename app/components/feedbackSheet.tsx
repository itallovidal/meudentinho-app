import { BottomSheet } from "@/components/ui/bottomSheet";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

type FeedbackSheetProps = {
  title: string;
  message: string | null;
  onClose: () => void;
  actionLabel?: string;
};

export function FeedbackSheet({
  title,
  message,
  onClose,
  actionLabel = "Entendi",
}: FeedbackSheetProps) {
  return (
    <BottomSheet
      visible={message !== null}
      onClose={onClose}
      header={<Text className="text-xl font-bold text-base-900">{title}</Text>}
    >
      <Text className="text-base text-base-500">{message}</Text>
      <Button onPress={onClose} className="w-full">
        <Text>{actionLabel}</Text>
      </Button>
    </BottomSheet>
  );
}
