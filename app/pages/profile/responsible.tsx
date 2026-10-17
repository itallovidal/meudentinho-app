import { deleteUser } from "@/api/user/deleteUser";
import { patchUser } from "@/api/user/patchUser";
import { DeleteAccountForm } from "@/components/forms/deleteAccountForm";
import { FieldShell } from "@/components/forms/fieldShell";
import { UpdateResponsibleForm } from "@/components/forms/updateResponsibleForm";
import { Header } from "@/components/header";
import { BottomSheet } from "@/components/ui/bottomSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import { UserContext } from "@/contexts/UserContext";
import { DeleteAccountDTO, UpdateProfileDTO } from "@/lib/schemas/responsible";
import { THEME } from "@/lib/theme";
import { getUserIdFromToken } from "@/lib/utils";
import { ApiError } from "@/types/domain";
import { useMutation } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { ProfileNavegationProp } from "@/navigation/ProfileStack";
import { TrashIcon } from "phosphor-react-native";
import { useContext, useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";

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
    updateAppUser,
    updateUserProfile,
    userId: contextUserId,
  } = useContext(UserContext)!;
  const navigation = useNavigation<ProfileNavegationProp>();
  const colors = THEME.light;
  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<ApiError | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");

  const deleteAccountMutation = useMutation({
    mutationFn: async (password: string) => {
      let resolvedUserId: string | null = contextUserId ?? null;
      if (!resolvedUserId && authToken) {
        try {
          resolvedUserId = getUserIdFromToken(authToken) ?? null;
        } catch {
          resolvedUserId = null;
        }
      }
      if (!resolvedUserId || !authToken) {
        throw new ApiError(
          "Sessão expirada. Faça login novamente.",
          "INVALID_CREDENTIALS",
        );
      }
      await deleteUser(resolvedUserId, authToken, password);
    },
  });

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

      if (emailChanged && !currentPassword) {
        Alert.alert("Erro", "Informe sua senha atual para trocar o e-mail.");
        return;
      }
      await patchUser(
        userId,
        authToken,
        {
          name: profile.name.trim(),
          email: profile.email.trim(),
        },
        emailChanged ? currentPassword : null,
      );

      await updateUserProfile({
        name: profile.name.trim(),
        email: profile.email.trim(),
      });
      setCurrentPassword("");
      });

      Alert.alert(
        "Dados atualizados",
        "As alterações foram salvas com sucesso.",
      );
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof ApiError
          ? error.message
          : "Não foi possível atualizar os dados.",
      );
    }
  }

  function handleOpenDeleteSheet() {
    setDeleteError(null);
    setDeleteSheetOpen(true);
  }

  function handleCloseDeleteSheet() {
    setDeleteSheetOpen(false);
    setDeleteError(null);
  }

  async function handleDeleteAccount({ password }: DeleteAccountDTO) {
    setDeleteError(null);
    try {
      await deleteAccountMutation.mutateAsync(password);
      setDeleteSheetOpen(false);
      await updateAppUser(null, null);
      navigation.reset({
        index: 0,
        routes: [{ name: "Index" }],
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setDeleteError(error);
        return;
      }
      setDeleteError(
        new ApiError(
          "Não foi possível excluir sua conta. Tente novamente.",
          "INTERNAL_SERVER_ERROR",
        ),
      );
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

        <View className="mt-6 w-full">
          <FieldShell label="Senha atual">
            <Input
              className="h-10 flex-1 border-0 bg-transparent px-0 shadow-none"
              onChangeText={setCurrentPassword}
              value={currentPassword}
              placeholder="Exigida para trocar o e-mail"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </FieldShell>
        </View>

        <View className="mt-8 w-full rounded-2xl bg-base-200 p-5 shadow-sm shadow-base-300">
          <Text variant="h4" className="text-destructive">
            Zona de perigo
          </Text>
          <Text className="mt-1 text-sm text-base-500">
            Excluir sua conta apaga todos os dependentes e o histórico. Esta
            ação é irreversível.
          </Text>
          <Button
            variant="ghost"
            onPress={handleOpenDeleteSheet}
            className="mt-3"
          >
            <TrashIcon size={20} color={colors.destructive} />
            <Text className="font-medium text-destructive">
              Excluir minha conta
            </Text>
          </Button>
        </View>
      </ScrollView>

      <BottomSheet
        visible={deleteSheetOpen}
        onClose={handleCloseDeleteSheet}
        header={
          <Text className="text-xl font-bold text-base-900">
            Excluir minha conta
          </Text>
        }
      >
        <DeleteAccountForm
          key={deleteSheetOpen ? "open" : "closed"}
          onSubmit={handleDeleteAccount}
          onCancel={handleCloseDeleteSheet}
          submitError={deleteError}
        />
      </BottomSheet>
    </Wrapper>
  );
}
