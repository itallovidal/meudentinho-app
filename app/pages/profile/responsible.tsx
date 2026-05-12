import { UpdateResponsibleForm } from "@/components/forms/updateResponsibleForm";
import { Header } from "@/components/header";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import { UserContext } from "@/contexts/UserContext";
import { useContext } from "react";
import { Alert, ScrollView, View } from "react-native";

export function Responsible() {
  const { user } = useContext(UserContext)!;

  async function handleUpdateResponsible(data: Record<string, unknown>) {
    Alert.alert("Dados atualizados", "As alterações foram salvas com sucesso.");
  }

  return (
    <Wrapper
      className="bg-base-200 flex-1"
      direction="column"
      align="center"
      justify="start"
      gap="gap-0"
    >
      <Header hasBackButton />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
        className="w-full"
      >
        <Text className="text-3xl font-bold mb-4">Responsável</Text>

        <View className="bg-base-100 rounded-lg p-4">
          <UpdateResponsibleForm
            onSubmit={handleUpdateResponsible}
            defaultName={user?.name}
          />
        </View>
      </ScrollView>
    </Wrapper>
  );
}
