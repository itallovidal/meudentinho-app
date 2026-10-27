import { useState } from "react";
import { BottomSheet } from "@/components/ui/bottomSheet";
import { Button } from "@/components/ui/button";
import { DentalCalendar } from "@/components/smile/DentalCalendar";
import { Text } from "@/components/ui/text";

type DatePickerSheetProps = {
  visible: boolean;
  value: string;
  minDate?: string;
  maxDate?: string;
  onConfirm: (dateKey: string) => void;
  onCancel: () => void;
};

export function DatePickerSheet({
  visible,
  value,
  minDate,
  maxDate,
  onConfirm,
  onCancel,
}: DatePickerSheetProps) {
  const [draft, setDraft] = useState(value);
  const [prevVisible, setPrevVisible] = useState(visible);
  const [prevValue, setPrevValue] = useState(value);

  if (visible !== prevVisible || value !== prevValue) {
    setPrevVisible(visible);
    setPrevValue(value);
    if (visible) {
      setDraft(value);
    }
  }

  return (
    <BottomSheet
      visible={visible}
      onClose={onCancel}
      header={
        <Text className="text-xl font-bold text-base-900">Selecionar data</Text>
      }
    >
      <DentalCalendar
        selectedDate={draft}
        minDate={minDate}
        maxDate={maxDate}
        onDayPress={setDraft}
      />
      <Button
        onPress={() => onConfirm(draft)}
        className="h-14 w-full rounded-full"
      >
        <Text className="text-base font-bold">Confirmar</Text>
      </Button>
    </BottomSheet>
  );
}
