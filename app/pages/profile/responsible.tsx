import { patchUser } from "@/api/user/patchUser";
import { UpdateResponsibleForm } from "@/components/forms/updateResponsibleForm";
import { Header } from "@/components/header";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import { UserContext } from "@/contexts/UserContext";
import {
  UpdatePasswordDTO,
  UpdateProfileDTO,
} from "@/lib/schemas/responsible";
import { getUserIdFromToken } from "@/lib/utils";
import { useContext } from "react";
import { Alert, ScrollView, View } from "react-native";

export function Responsible() {
  const { user, authToken, updateAppUser } = useContext(UserContext)!;

  async function handleUpdateResponsible(
    profile: UpdateProfileDTO,
    password: UpdatePasswordDTO | null,
  ) {
    if (!authToken || !user) {
      Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
      return;
    }

    try {
      const userId = getUserIdFromToken(authToken);
      const nameChanged = profile.name !== user.name;
      const emailChanged = profile.email !== user.email;
      const hasProfileChange = nameChanged || emailChanged;

      if (hasProfileChange) {
        await patchUser(userId, authToken, {
          name: profile.name,
          email: profile.email,
        });

        updateAppUser(
          { ...user, name: profile.name, email: profile.email },
          authToken,
        );
      }

      if (password) {
        await patchUser(userId, authToken, {
          password: password.newPassword,
        });
      }

      Alert.alert("Dados atualizados", "As alterações foram salvas com sucesso.");
    } catch (error) {
      console.error("Error updating user:", error);
      Alert.alert("Erro", "Não foi possível atualizar os dados.");
    }
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
            defaultEmail={user?.email}
          />
        </View>
      </ScrollView>
    </Wrapper>
  );
}
