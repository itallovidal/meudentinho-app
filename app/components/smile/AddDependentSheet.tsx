import { Text } from "@/components/ui/text";
import { BottomSheet } from "@/components/ui/bottomSheet";
import { RegisterKidForm } from "@/components/forms/registerKidForm";
import { KidFormValues } from "@/lib/schemas/kid";
import { ApiError } from "@/types/domain";

type AddDependentSheetProps = {
  visible: boolean;
  submitError: ApiError | null;
  onClose: () => void;
  onSubmit: (data: KidFormValues) => void | Promise<void>;
};

const ADD_DEPENDENT_PORTAL_HOST = "add-dependent-sheet";

export function AddDependentSheet({
  visible,
  submitError,
  onClose,
  onSubmit,
}: AddDependentSheetProps) {
  return (
    <BottomSheet
      visible={visible}
      portalHostName={ADD_DEPENDENT_PORTAL_HOST}
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
        popoverHost={ADD_DEPENDENT_PORTAL_HOST}
      />
    </BottomSheet>
  );
}
