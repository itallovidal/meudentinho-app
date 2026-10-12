import { createKid } from "@/api/kids/createKid";
import { deleteKid } from "@/api/kids/deleteKid";
import { getAllKids } from "@/api/kids/getAllKids";
import { patchKid } from "@/api/kids/patchKid";
import { updateKid } from "@/api/kids/updateKid";
import { RegisterKidForm } from "@/components/forms/registerKidForm";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import { UserContext } from "@/contexts/UserContext";
import { KidRequestDTO, KidResponseDTO } from "@/types/dtos/user";
import { formatAgeFromBirthDate, shouldUsePut } from "@/lib/utils";
import { THEME } from "@/lib/theme";
import { TrashIcon, UsersThreeIcon } from "phosphor-react-native";
import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ProfileNavegationProp } from "@/navigation/ProfileStack";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function Dependents() {
  const [loading, setLoading] = useState(true);
  const { authToken, hydrated } = useContext(UserContext)!;
  const [kids, setKids] = useState<KidResponseDTO[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const navigation = useNavigation<ProfileNavegationProp>();
  const queryClient = useQueryClient();
  const colors = THEME.light;

  const isEmptyState = !loading && !loadError && kids.length === 0;

  useEffect(() => {
    loadDependents();
  }, []);

  useEffect(() => {
    if (hydrated && !authToken) {
      navigation.navigate("Login");
    }
  }, [hydrated, authToken, navigation]);

  const saveKidMutation = useMutation({
    mutationFn: ({
      kidId,
      data,
      usePut,
    }: {
      kidId: string;
      data: KidRequestDTO;
      usePut: boolean;
    }) =>
      usePut
        ? updateKid(kidId, authToken ?? "", data)
        : patchKid(kidId, authToken ?? "", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["kids"] }),
  });

  const createKidMutation = useMutation({
    mutationFn: (data: KidRequestDTO) => createKid(data, authToken ?? ""),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["kids"] }),
  });

  const deleteKidMutation = useMutation({
    mutationFn: (kidId: string) => deleteKid(kidId, authToken ?? ""),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["kids"] }),
  });

  async function loadDependents() {
    try {
      await loadKids();
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleRetryLoad() {
    setLoading(true);
    setLoadError(false);
    await loadDependents();
  }

  async function handleSubmitKidForm(data: KidRequestDTO, index: number) {
    try {
      if (!authToken) {
        Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
        return;
      }

      const kidToEdit = kids[index];
      const usePut = shouldUsePut(
        {
          name: kidToEdit.name,
          birthDate: kidToEdit.birthDate,
          gender: kidToEdit.gender,
          prematureWeeks: kidToEdit.prematureWeeks ?? "",
        },
        {
          name: data.name,
          birthDate: data.birthDate,
          gender: data.gender,
          prematureWeeks: data.prematureWeeks ?? "",
        },
        ["name", "birthDate", "gender", "prematureWeeks"],
      );

      if (usePut) {
        await saveKidMutation.mutateAsync({
          kidId: kidToEdit.id,
          data,
          usePut: true,
        });
      } else {
        await saveKidMutation.mutateAsync({
          kidId: kidToEdit.id,
          data,
          usePut: false,
        });
      }

      await loadKids();
      Alert.alert("Sucesso", "Filho atualizado com sucesso.");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o filho.");
    }
  }

  async function handleCreateKidForm(data: KidRequestDTO) {
    try {
      if (!authToken) {
        Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
        return;
      }

      await createKidMutation.mutateAsync(data);
      await loadKids();
      setShowCreateForm(false);
      Alert.alert("Sucesso", "Filho cadastrado com sucesso.");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível cadastrar o filho.");
    }
  }

  function handleDeletePress(kidId: string, kidName: string) {
    Alert.alert(
      "Excluir filho",
      `Deseja excluir ${kidName}? Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => void handleConfirmDelete(kidId),
        },
      ],
    );
  }

  async function handleConfirmDelete(kidId: string) {
    if (!authToken) {
      Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
      return;
    }
    setDeletingId(kidId);
    try {
      await deleteKidMutation.mutateAsync(kidId);
      await loadKids();
      Alert.alert("Sucesso", "Filho excluído com sucesso.");
    } catch {
      Alert.alert("Erro", "Não foi possível excluir o filho.");
    } finally {
      setDeletingId(null);
    }
  }

  function renderItem({
    dependent,
    index,
  }: {
    dependent: KidResponseDTO;
    index: number;
  }) {
    const ageText = formatAgeFromBirthDate(dependent.birthDate);
    return (
      <View key={dependent.id} className="w-full">
        <View className="mb-2 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="font-bold" numberOfLines={1}>
              {dependent.name}
            </Text>
            {ageText && (
              <Text className="text-sm text-base-500">{ageText}</Text>
            )}
          </View>
          <Button
            variant="ghost"
            onPress={() => handleDeletePress(dependent.id, dependent.name)}
            disabled={deletingId !== null}
            className="px-2"
          >
            {deletingId === dependent.id ? (
              <ActivityIndicator size="small" color={colors.destructive} />
            ) : (
              <TrashIcon size={20} color={colors.destructive} />
            )}
          </Button>
        </View>
        <View className="bg-base-100 rounded-xl p-6">
          <RegisterKidForm
            onSubmit={(data) => handleSubmitKidForm(data, index)}
            defaultValues={{
              name: dependent.name,
              birthDate: dependent.birthDate,
              gender: dependent.gender,
              prematureWeeks: dependent.prematureWeeks ?? undefined,
            }}
            submitLabel="Salvar"
            submittingLabel="Salvando..."
          />
        </View>
      </View>
    );
  }

  if (!hydrated) {
    return (
      <Wrapper
        className="bg-base-200 flex-1"
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
      className="bg-base-200 flex-1"
      direction="column"
      align="center"
      justify="start"
      gap="gap-0"
    >
      <Header hasBackButton />

      <ScrollView
        className="w-full px-6"
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 16 }}
      >
        <Wrapper
          direction="column"
          className={`w-full ${isEmptyState ? "flex-1 justify-center" : ""}`}
          gap="gap-4"
        >
          <Wrapper direction="column" gap="gap-1">
            <Text
              variant="h2"
              className={`mb-0 ${isEmptyState ? "text-center" : ""}`}
            >
              Filhos
            </Text>
            <Text
              className={`text-muted ${isEmptyState ? "text-center" : ""}`}
            >
              Gerencie as crianças vinculadas à sua conta.
            </Text>
          </Wrapper>

          {loading && (
            <View className="bg-base-100 rounded-xl p-4 flex-row items-center justify-center gap-2">
              <ActivityIndicator
                size="small"
                color={colors.primary400}
              />
              <Text>Carregando filhos...</Text>
            </View>
          )}

          {!loading && loadError && (
            <View className="bg-base-100 rounded-xl px-5 py-6 items-center">
              <Text className="font-bold text-lg text-center mb-2">
                Não foi possível carregar
              </Text>
              <Text className="text-base-500 text-center mb-5">
                Verifique sua conexão e tente novamente.
              </Text>
              <Button onPress={handleRetryLoad} className="h-12">
                <Text>Tentar novamente</Text>
              </Button>
            </View>
          )}

          {!loading && isEmptyState && !showCreateForm && (
            <View className="bg-base-100 rounded-xl px-5 py-6 items-center">
              <View className="mb-4 items-center justify-center rounded-full bg-primary-100 p-5">
                <UsersThreeIcon
                  size={40}
                  color={colors.primary400}
                  weight="fill"
                />
              </View>
              <Text className="font-bold text-lg text-center mb-2">
                Nenhum filho cadastrado
              </Text>
              <Text className="text-base-500 text-center mb-5">
                Adicione o primeiro filho para começar a gerenciar os
                dados.
              </Text>
              <Button onPress={() => setShowCreateForm(true)} className="h-12">
                <Text>Adicionar filho</Text>
              </Button>
            </View>
          )}

          {!loading &&
            !isEmptyState &&
            kids.map((kid, index) => renderItem({ dependent: kid, index }))}

          {showCreateForm && (
            <View className="bg-base-100 rounded-xl p-6">
              <RegisterKidForm
                onSubmit={handleCreateKidForm}
                submitLabel="Adicionar novo filho"
                submittingLabel="Adicionando novo filho..."
              />
            </View>
          )}

          {!loading && !isEmptyState && !showCreateForm && (
            <Button
              onPress={() => setShowCreateForm(true)}
              className="w-full"
              variant="default"
            >
              <Text>Novo filho</Text>
            </Button>
          )}
        </Wrapper>
      </ScrollView>
    </Wrapper>
  );

  async function loadKids() {
    const { data } = await getAllKids(authToken!);
    setKids(data || []);
  }
}
