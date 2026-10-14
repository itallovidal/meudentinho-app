import { RegisterKidForm } from "@/components/forms/registerKidForm";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirmDialog";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { Wrapper } from "@/components/wrapper";
import { UserContext } from "@/contexts/UserContext";
import { useKidMutations } from "@/hooks/useKidMutations";
import { shouldUsePut } from "@/lib/utils";
import { THEME } from "@/lib/theme";
import { ProfileNavegationProp } from "@/navigation/ProfileStack";
import {
  goBackToOriginTab,
  type LooseNavigation,
} from "@/navigation/crossTabBack";
import { KidRequestDTO, KidResponseDTO } from "@/types/dtos/user";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { TrashIcon } from "phosphor-react-native";
import { useContext, useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import type { ProfileRouteParams } from "@/navigation/ProfileStack";

const PUT_FIELDS = ["name", "birthDate", "gender", "prematureWeeks"] as const;

export function EditDependent() {
  const colors = THEME.light;
  const { authToken, hydrated } = useContext(UserContext)!;
  const navigation = useNavigation<ProfileNavegationProp>();
  const { params } = useRoute<RouteProp<ProfileRouteParams, "EditDependent">>();
  const kid = params?.kid;
  const isEditing = kid !== undefined;
  const { showToast } = useToast();
  const { createKidMutation, saveKidMutation, deleteKidMutation } =
    useKidMutations(authToken);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function exitScreen() {
    if (
      goBackToOriginTab(
        navigation as unknown as LooseNavigation,
        "EditDependent",
        params,
      )
    ) {
      return;
    }
    navigation.goBack();
  }

  useEffect(() => {
    if (hydrated && !authToken) {
      navigation.replace("Login");
    }
  }, [hydrated, authToken, navigation]);

  async function handleCreate(data: KidRequestDTO) {
    try {
      await createKidMutation.mutateAsync(data);
      showToast("Dependente cadastrado com sucesso.");
      exitScreen();
    } catch {
      Alert.alert("Erro", "Não foi possível cadastrar o dependente.");
    }
  }

  async function handleUpdate(kid: KidResponseDTO, data: KidRequestDTO) {
    try {
      const usePut = shouldUsePut(
        {
          name: kid.name,
          birthDate: kid.birthDate,
          gender: kid.gender,
          prematureWeeks: kid.prematureWeeks ?? "",
        },
        {
          name: data.name,
          birthDate: data.birthDate,
          gender: data.gender,
          prematureWeeks: data.prematureWeeks ?? "",
        },
        [...PUT_FIELDS],
      );
      await saveKidMutation.mutateAsync({ kidId: kid.id, data, usePut });
      showToast("Dependente atualizado com sucesso.");
      exitScreen();
    } catch {
      Alert.alert("Erro", "Não foi possível atualizar o dependente.");
    }
  }

  async function handleDelete() {
    setConfirmingDelete(false);
    if (!kid) {
      return;
    }
    try {
      await deleteKidMutation.mutateAsync(kid.id);
      showToast("Dependente excluído com sucesso.");
      exitScreen();
    } catch {
      Alert.alert("Erro", "Não foi possível excluir o dependente.");
    }
  }

  if (!hydrated) {
    return (
      <Wrapper
        className="flex-1 bg-base-200"
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
      className="flex-1 bg-base-200"
      direction="column"
      align="center"
      justify="start"
      gap="gap-0"
    >
      <Header hasBackButton />

      <ScrollView
        className="w-full px-6"
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <Wrapper direction="column" className="w-full" gap="gap-4">
          <View className="w-full rounded-2xl bg-base-100 p-5 shadow-sm shadow-base-300">
            <RegisterKidForm
              onSubmit={kid ? (data) => handleUpdate(kid, data) : handleCreate}
              defaultValues={
                kid
                  ? {
                      name: kid.name,
                      birthDate: kid.birthDate,
                      gender: kid.gender,
                      prematureWeeks: kid.prematureWeeks ?? undefined,
                    }
                  : undefined
              }
              submitLabel={isEditing ? "Salvar alterações" : "Confirmar"}
              submittingLabel={isEditing ? "Salvando..." : "Adicionando..."}
              footer={
                <Button
                  variant="outline"
                  onPress={exitScreen}
                  className="h-14 w-full rounded-full border-primary-500 bg-base-100"
                >
                  <Text className="font-medium text-primary-500">Cancelar</Text>
                </Button>
              }
            />
          </View>

          {isEditing && (
            <Button
              variant="ghost"
              onPress={() => setConfirmingDelete(true)}
              disabled={deleteKidMutation.isPending}
              className="self-center"
            >
              <TrashIcon size={20} color={colors.destructive} />
              <Text className="font-medium text-destructive">
                {`Remover dependente`}
              </Text>
            </Button>
          )}
        </Wrapper>
      </ScrollView>

      <ConfirmDialog
        open={confirmingDelete}
        title="Excluir dependente"
        message={`Deseja excluir ${kid?.name ?? ""}? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        destructive
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmingDelete(false)}
      />
    </Wrapper>
  );
}
