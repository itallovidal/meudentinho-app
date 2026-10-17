import { patchUser } from "@/api/user/patchUser";
import { UpdateResponsibleForm } from "@/components/forms/updateResponsibleForm";
import { Header } from "@/components/header";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import { UserContext } from "@/contexts/UserContext";
import { UpdateProfileDTO } from "@/lib/schemas/responsible";
import { getUserIdFromToken } from "@/lib/utils";
import { useContext, useEffect } from "react";
import { Alert, ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ProfileNavegationProp } from "@/navigation/ProfileStack";

function getInitials(name?: string) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const second = parts.length > 1 ? parts[1][0] : "";
  return (first + second).toUpperCase();
}

export function Responsible() {
  const {
    user,
    authToken,
    hydrated,
    updateUserProfile,
    userId: contextUserId,
  } = useContext(UserContext)!;
  const navigation = useNavigation<ProfileNavegationProp>();

  useEffect(() => {
    if (hydrated && !authToken) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
  }, [hydrated, authToken, navigation]);

  async function handleUpdateResponsible(profile: UpdateProfileDTO) {
    if (!authToken || !user) {
      Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
      return;
    }

    try {
      const userId =
        contextUserId ?? (authToken ? getUserIdFromToken(authToken) : null);
      if (!userId) {
        Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
        return;
      }
      const nameChanged = profile.name.trim() !== user.name;
      const emailChanged = profile.email.trim() !== user.email;

      if (!nameChanged && !emailChanged) {
        return;
      }

      await patchUser(userId, authToken, {
        name: profile.name.trim(),
        email: profile.email.trim(),
      });

      await updateUserProfile({
        name: profile.name.trim(),
        email: profile.email.trim(),
      });

      Alert.alert(
        "Dados atualizados",
        "As alterações foram salvas com sucesso.",
      );
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar os dados.");
    }
  }

  if (!hydrated) {
    return (
      <Wrapper
        className="flex-1 bg-base-100"
        direction="column"
        align="center"
        justify="start"
        gap="gap-0"
      >
        <Header hasBackButton />
        <Text>Carregando...</Text>
      </Wrapper>
    );
  }

  if (!authToken) {
    return null;
  }

  return (
    <Wrapper
      className="flex-1 bg-base-100"
      direction="column"
      align="center"
      justify="start"
      gap="gap-0"
    >
      <Header hasBackButton />
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 28 }}
        className="w-full"
      >
        <View className="mb-10 mt-4 items-center">
          <View className="h-32 w-32 items-center justify-center rounded-full bg-base-300">
            <Text className="text-4xl font-semibold text-primary-500">
              {getInitials(user?.name)}
            </Text>
          </View>
        </View>

        <UpdateResponsibleForm
          onSubmit={handleUpdateResponsible}
          onChangePassword={() => navigation.navigate("ChangePassword")}
          defaultName={user?.name}
          defaultEmail={user?.email}
        />
      </ScrollView>
    </Wrapper>
  );
}
