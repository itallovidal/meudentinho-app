import { RegisterKidForm } from "@/components/forms/registerKidForm";
import { Header } from "@/components/header";
import { BottomSheet } from "@/components/ui/bottomSheet";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { Wrapper } from "@/components/wrapper";
import { UserContext } from "@/contexts/UserContext";
import { useKidMutations } from "@/hooks/useKidMutations";
import { errorMessage } from "@/lib/errorMessage";
import { buildKidRequest } from "@/lib/privacyPolicy";
import { shouldUsePut } from "@/lib/utils";
import { THEME } from "@/lib/theme";
import { ProfileNavegationProp } from "@/navigation/ProfileStack";
import {
  goBackToOriginTab,
  type LooseNavigation,
} from "@/navigation/crossTabBack";
import type { KidResponseDTO } from "@/types/dtos/user";
import { KidFormValues } from "@/lib/schemas/kid";
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
  const { createKidMutation, saveKidMutation, revokeKidMutation } =
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

  async function handleCreate(data: KidFormValues) {
    try {
      await createKidMutation.mutateAsync(await buildKidRequest(data));
      showToast("Dependente cadastrado com sucesso.");
      exitScreen();
    } catch (error) {
      Alert.alert(
        "Erro",
        errorMessage(error, "Não foi possível cadastrar o dependente."),
      );
    }
  }

  async function handleUpdate(kid: KidResponseDTO, data: KidFormValues) {
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
      await saveKidMutation.mutateAsync({
        kidId: kid.id,
        data: await buildKidRequest(data),
        usePut,
      });
      showToast("Dependente atualizado com sucesso.");
      exitScreen();
    } catch (error) {
      Alert.alert(
        "Erro",
        errorMessage(error, "Não foi possível atualizar o dependente."),
      );
    }
  }

  async function handleDelete() {
    setConfirmingDelete(false);
    if (!kid) {
      return;
    }
    try {
      await revokeKidMutation.mutateAsync(kid.id);
      showToast("Consentimento revogado com sucesso.");
      exitScreen();
    } catch (error) {
      Alert.alert(
        "Erro",
        errorMessage(error, "Não foi possível revogar o consentimento."),
      );
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
              disabled={revokeKidMutation.isPending}
              className="self-center"
            >
              <TrashIcon size={20} color={colors.destructive} />
              <Text className="font-medium text-destructive">
                {`Revogar consentimento`}
              </Text>
            </Button>
          )}
        </Wrapper>
      </ScrollView>

      <BottomSheet
        visible={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        header={
          <Text className="text-xl font-bold text-base-900">
            Revogar consentimento
          </Text>
        }
      >
        <Text className="text-base text-base-500">
          {`Isso apaga ${kid?.name ?? ""} e todo o histórico. Esta ação não pode ser desfeita.`}
        </Text>
        <Button
          variant="destructive"
          onPress={() => void handleDelete()}
          disabled={revokeKidMutation.isPending}
          className="h-14 w-full rounded-full"
        >
          <Text className="text-base font-bold">
            {revokeKidMutation.isPending ? "Revogando..." : "Revogar"}
          </Text>
        </Button>
        <Button
          variant="outline"
          onPress={() => setConfirmingDelete(false)}
          disabled={revokeKidMutation.isPending}
          className="h-14 w-full rounded-full"
        >
          <Text className="text-base font-bold">Cancelar</Text>
        </Button>
      </BottomSheet>
    </Wrapper>
  );
}
