import { createKid } from "@/api/kids/createKid";
import { deleteKid } from "@/api/kids/deleteKid";
import { getAllKids } from "@/api/kids/getAllKids";
import { patchKid } from "@/api/kids/patchKid";
import { updateKid } from "@/api/kids/updateKid";
import { RegisterKidForm } from "@/components/forms/registerKidForm";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirmDialog";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import { UserContext } from "@/contexts/UserContext";
import { ApiError } from "@/types/domain";
import { KidRequestDTO, KidResponseDTO } from "@/types/dtos/user";
import {
  formatAgeFromBirthDate,
  formatDatePtBR,
  shouldUsePut,
} from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { THEME } from "@/lib/theme";
import {
  CaretRightIcon,
  PlusIcon,
  TrashIcon,
  UsersThreeIcon,
} from "phosphor-react-native";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  Alert,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ProfileNavegationProp } from "@/navigation/ProfileStack";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function Dependents() {
  const [loading, setLoading] = useState(true);
  const { authToken, hydrated } = useContext(UserContext)!;
  const [kids, setKids] = useState<KidResponseDTO[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingKid, setEditingKid] = useState<KidResponseDTO | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<KidResponseDTO | null>(
    null,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [loadFailure, setLoadFailure] = useState<"auth" | "network" | null>(
    null,
  );
  const navigation = useNavigation<ProfileNavegationProp>();
  const queryClient = useQueryClient();
  const colors = THEME.light;
  const { showToast } = useToast();

  const isEmptyState = !loading && !loadFailure && kids.length === 0;
  const isFormOpen = showCreateForm || editingKid !== null;

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
      setLoadFailure(null);
    } catch (error) {
      if (error instanceof ApiError && error.code === "INVALID_CREDENTIALS") {
        setLoadFailure("auth");
      } else {
        setLoadFailure("network");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRetryLoad() {
    setLoading(true);
    setLoadFailure(null);
    await loadDependents();
  }

  function handleLoginAgain() {
    navigation.navigate("Login");
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadDependents();
    setRefreshing(false);
  }

  async function handleSubmitKidForm(data: KidRequestDTO) {
    try {
      if (!authToken) {
        Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
        return;
      }
      const kidToEdit = editingKid;
      if (!kidToEdit) {
        return;
      }

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

      await saveKidMutation.mutateAsync({
        kidId: kidToEdit.id,
        data,
        usePut,
      });

      await loadKids();
      setEditingKid(null);
      showToast("Dependente atualizado com sucesso.");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o dependente.");
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
      showToast("Dependente cadastrado com sucesso.");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível cadastrar o dependente.");
    }
  }

  function handleDeletePress(dependent: KidResponseDTO) {
    setConfirmDelete(dependent);
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
      if (editingKid?.id === kidId) {
        setEditingKid(null);
      }
      showToast("Dependente excluído com sucesso.");
    } catch {
      Alert.alert("Erro", "Não foi possível excluir o dependente.");
    } finally {
      setDeletingId(null);
    }
  }

  function handleCloseForm() {
    setShowCreateForm(false);
    setEditingKid(null);
  }

  function buildKidSubtitle(dependent: KidResponseDTO): string {
    const parts: string[] = [];
    const ageText = formatAgeFromBirthDate(dependent.birthDate);
    if (ageText) {
      parts.push(ageText);
    }
    const birthBr = formatDatePtBR(dependent.birthDate);
    if (birthBr) {
      parts.push(birthBr);
    }
    parts.push(dependent.gender === "male" ? "M" : "F");
    return parts.join(" • ");
  }

  function renderKidCard({ dependent }: { dependent: KidResponseDTO }) {
    const subtitle = buildKidSubtitle(dependent);
    const initial = (dependent.name.trim().charAt(0) || "?").toUpperCase();
    return (
      <View
        key={dependent.id}
        className="w-full rounded-2xl bg-base-100 p-3 shadow-sm shadow-base-300"
      >
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() => {
              setShowCreateForm(false);
              setEditingKid(dependent);
            }}
            activeOpacity={0.7}
            className="flex-1 flex-row items-center gap-3"
          >
            <View className="h-12 w-12 items-center justify-center rounded-full bg-primary-100">
              <Text className="text-lg font-bold text-primary-500">
                {initial}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold" numberOfLines={1}>
                {dependent.name}
              </Text>
              {subtitle ? (
                <Text className="text-sm text-base-500" numberOfLines={1}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
            <CaretRightIcon size={20} color={colors.base500} />
          </TouchableOpacity>
          <Button
            variant="ghost"
            onPress={() => handleDeletePress(dependent)}
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
      </View>
    );
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

      <View className="relative w-full flex-1">
        <ScrollView
          className="w-full px-6"
          contentContainerStyle={{ flexGrow: 1, paddingVertical: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <Wrapper direction="column" className="w-full" gap="gap-4">
            {editingKid ? (
              <>
                <Text variant="h2" className="mb-0" numberOfLines={1}>
                  {editingKid.name}
                </Text>
                <View
                  key={editingKid.id}
                  className="w-full rounded-2xl bg-base-100 p-5 shadow-sm shadow-base-300"
                >
                  <RegisterKidForm
                    onSubmit={handleSubmitKidForm}
                    defaultValues={{
                      name: editingKid.name,
                      birthDate: editingKid.birthDate,
                      gender: editingKid.gender,
                      prematureWeeks: editingKid.prematureWeeks ?? undefined,
                    }}
                    submitLabel="Confirmar"
                    submittingLabel="Salvando..."
                  />
                </View>
                <View className="w-full flex-row gap-2">
                  <Button
                    variant="outline"
                    onPress={handleCloseForm}
                    className="h-12 flex-1"
                  >
                    <Text>Cancelar</Text>
                  </Button>
                  <Button
                    variant="ghost"
                    onPress={() => handleDeletePress(editingKid)}
                    disabled={deletingId !== null}
                    className="h-12 flex-1"
                  >
                    <Text className="text-destructive">Excluir</Text>
                  </Button>
                </View>
              </>
            ) : showCreateForm ? (
              <>
                <Text variant="h2" className="mb-0">
                  Novo dependente
                </Text>
                <View className="w-full rounded-2xl bg-base-100 p-5 shadow-sm shadow-base-300">
                  <RegisterKidForm
                    onSubmit={handleCreateKidForm}
                    submitLabel="Confirmar"
                    submittingLabel="Adicionando..."
                  />
                </View>
                <Button
                  variant="outline"
                  onPress={handleCloseForm}
                  className="h-12 w-full"
                >
                  <Text>Cancelar</Text>
                </Button>
              </>
            ) : (
              <>
                <Wrapper direction="column" gap="gap-1">
                  <Text
                    variant="h2"
                    className={`mb-0 ${isEmptyState ? "text-center" : ""}`}
                  >
                    Dependentes
                  </Text>
                  <Text
                    className={`text-muted ${isEmptyState ? "text-center" : ""}`}
                  >
                    {isEmptyState
                      ? "Adicione o primeiro dependente para começar."
                      : "Toque em um dependente para editar os dados."}
                  </Text>
                </Wrapper>

                {loading && (
                  <View className="flex-row items-center justify-center gap-2 rounded-xl bg-base-100 p-4">
                    <ActivityIndicator size="small" color={colors.primary400} />
                    <Text>Carregando dependentes...</Text>
                  </View>
                )}

                {!loading && loadFailure === "auth" && (
                  <View className="items-center rounded-xl bg-base-100 px-5 py-6">
                    <Text className="mb-2 text-center text-lg font-bold">
                      Sessão expirada
                    </Text>
                    <Text className="mb-5 text-center text-base-500">
                      Faça login novamente para gerenciar os dependentes.
                    </Text>
                    <Button onPress={handleLoginAgain} className="h-12">
                      <Text>Fazer login</Text>
                    </Button>
                  </View>
                )}

                {!loading && loadFailure === "network" && (
                  <View className="items-center rounded-xl bg-base-100 px-5 py-6">
                    <Text className="mb-2 text-center text-lg font-bold">
                      Não foi possível carregar
                    </Text>
                    <Text className="mb-5 text-center text-base-500">
                      Verifique sua conexão e tente novamente.
                    </Text>
                    <Button onPress={handleRetryLoad} className="h-12">
                      <Text>Tentar novamente</Text>
                    </Button>
                  </View>
                )}

                {!loading && isEmptyState && (
                  <View className="items-center rounded-xl bg-base-100 px-5 py-6">
                    <View className="mb-4 items-center justify-center rounded-full bg-primary-100 p-5">
                      <UsersThreeIcon
                        size={40}
                        color={colors.primary400}
                        weight="fill"
                      />
                    </View>
                    <Text className="mb-2 text-center text-lg font-bold">
                      Nenhum dependente cadastrado
                    </Text>
                    <Text className="text-center text-base-500">
                      Toque no botão + para adicionar o primeiro dependente.
                    </Text>
                  </View>
                )}

                {!loading &&
                  !isEmptyState &&
                  kids.map((kid) => renderKidCard({ dependent: kid }))}
              </>
            )}
          </Wrapper>
        </ScrollView>

        {!loading && !loadFailure && !isFormOpen && (
          <TouchableOpacity
            onPress={() => setShowCreateForm(true)}
            activeOpacity={0.8}
            accessibilityLabel="Novo dependente"
            className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-black/20"
          >
            <PlusIcon size={24} weight="bold" color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Excluir dependente"
        message={`Deseja excluir ${confirmDelete?.name ?? ""}? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        destructive
        onConfirm={() => {
          const target = confirmDelete;
          setConfirmDelete(null);
          if (target) {
            void handleConfirmDelete(target.id);
          }
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </Wrapper>
  );

  async function loadKids() {
    const { data } = await getAllKids(authToken!);
    setKids(data || []);
  }
}
