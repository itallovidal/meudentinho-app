import { View } from "react-native";
import { Text } from "../ui/text";
import { Wrapper } from "../wrapper";
import { RegisterKidForm } from "../forms/registerKidForm";
import { KidFormValues } from "@/lib/schemas/kid";
import { ApiError } from "@/types/domain";

type RegisterKidSectionProps = {
  onRegisterKid: (kidDTO: KidFormValues) => Promise<void>;
  registerKidError: ApiError | null;
  isPending?: boolean;
};

export function RegisterKidSection({
  onRegisterKid,
  registerKidError,
  isPending = false,
}: RegisterKidSectionProps) {
  async function handleSubmit(kidDTO: KidFormValues) {
    if (isPending) {
      return;
    }
    await onRegisterKid(kidDTO);
  }

  return (
    <Wrapper
      className="mt-4 flex-1"
      direction="column"
      align="start"
      justify="start"
      gap="gap-4"
    >
      <Wrapper direction="column" gap="gap-2">
        <Text variant={"h4"} className="mb-0">
          Bem Vindo ao MeuDentinho!
        </Text>
        <Text className="text-muted">
          Precisamos de alguns dados básicos para começar a acompanhar o
          desenvolvimento dentário da criança de forma personalizada.
        </Text>
      </Wrapper>

      <View className="w-full rounded-xl bg-base-100 p-6 shadow-sm shadow-base-300">
        <RegisterKidForm
          onSubmit={handleSubmit}
          submitError={registerKidError}
        />
      </View>
    </Wrapper>
  );
}
