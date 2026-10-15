import { Text } from "@/components/ui/text";
import { BottomSheet } from "@/components/ui/bottomSheet";
import { RegisterKidForm } from "@/components/forms/registerKidForm";
import { ApiError } from "@/types/domain";
import { KidRequestDTO } from "@/types/dtos/user";

type AddDependentSheetProps = {
  visible: boolean;
  submitError: ApiError | null;
  onClose: () => void;
  onSubmit: (data: KidRequestDTO) => void | Promise<void>;
};

export function AddDependentSheet({
  visible,
  submitError,
  onClose,
  onSubmit,
}: AddDependentSheetProps) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      header={
        <Text className="text-xl font-bold text-base-900">
          Adicionar Dependente
        </Text>
      }
    >
      <RegisterKidForm
        onSubmit={onSubmit}
        submitError={submitError}
        submittingLabel="Adicionando..."
      />
    </BottomSheet>
  );
}
