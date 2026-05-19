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
      className="my-4 flex-1"
      direction="column"
      align="start"
      justify="start"
      gap="gap-2"
    >
      <Text variant={"h4"}>Bem Vindo ao MeuDentinho!</Text>

      <View className="w-full">
        <View className="w-full">
          <Text>
            Precisamos de alguns dados básicos para começar a acompanhar o
            desenvolvimento dentário da criança de forma personalizada.
          </Text>
        </View>
        <View className="w-full rounded-lg bg-base-100 p-4">
          <RegisterKidForm
            onSubmit={onRegisterKid}
            submitError={registerKidError}
          />
        </View>
      </View>
    </Wrapper>
  );
}
