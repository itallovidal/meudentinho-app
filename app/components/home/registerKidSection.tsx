import { View } from "react-native";
import { Text } from "../ui/text";
import { Wrapper } from "../wrapper";
import { RegisterKidForm } from "../forms/registerKidForm";
import { KidRequestDTO } from "@/types/dtos/user";
import { ApiError } from "@/types/domain";

type RegisterKidSectionProps = {
  onRegisterKid: (kidDTO: KidRequestDTO) => Promise<void>;
  registerKidError: ApiError | null;
};

export function RegisterKidSection({
  onRegisterKid,
  registerKidError,
}: RegisterKidSectionProps) {
  return (
    <Wrapper
      className="flex-1 mt-4"
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
          onSubmit={onRegisterKid}
          submitError={registerKidError}
        />
      </View>
    </Wrapper>
  );
}
