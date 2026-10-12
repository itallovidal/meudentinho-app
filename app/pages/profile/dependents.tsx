import { createKid } from "@/api/kids/createKid";
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
import { shouldUsePut } from "@/lib/utils";
import React, { useContext, useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";

export function Dependents() {
  const [loading, setLoading] = useState(true);
  const { authToken } = useContext(UserContext)!;
  const [kids, setKids] = useState<KidResponseDTO[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const isEmptyState = !loading && kids.length === 0;

  useEffect(() => {
    loadDependents();
  }, []);

  async function loadDependents() {
    try {
      await loadKids();
    } catch (error) {
      console.log("Error fetching dependents:", error);
    } finally {
      setLoading(false);
    }
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
        await updateKid(kidToEdit.id, authToken, data);
      } else {
        await patchKid(kidToEdit.id, authToken, data);
      }

      await loadKids();
      Alert.alert("Sucesso", "Dependente atualizado com sucesso.");
    } catch (error) {
      console.error("Error updating dependent:", error);
      Alert.alert("Erro", "Não foi possível atualizar o dependente.");
    }
  }

  async function handleCreateKidForm(data: KidRequestDTO) {
    try {
      if (!authToken) {
        Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
        return;
      }

      await createKid(data, authToken);
      await loadKids();
      setShowCreateForm(false);
      Alert.alert("Sucesso", "Dependente cadastrado com sucesso.");
    } catch (error) {
      console.error("Error creating dependent:", error);
      Alert.alert("Erro", "Não foi possível cadastrar o dependente.");
    }
  }

  function renderItem({
    dependent,
    index,
  }: {
    dependent: KidResponseDTO;
    index: number;
  }) {
    return (
      <View key={dependent.id}>
        <Text className="font-bold mb-2">{dependent.name}</Text>
        <View className="bg-base-100 rounded-lg p-4">
          <RegisterKidForm
            onSubmit={(data) => handleSubmitKidForm(data, index)}
            defaultValues={{
              name: dependent.name,
              birthDate: dependent.birthDate,
              gender: dependent.gender,
              prematureWeeks: dependent.prematureWeeks ?? undefined,
            }}
            submitLabel="Salvar dependente"
            submittingLabel="Salvando dependente..."
          />
        </View>
      </View>
    );
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
          {loading && (
            <View className="bg-base-100 rounded-lg p-4">
              <Text>Carregando dependentes...</Text>
            </View>
          )}

          {!loading && isEmptyState && !showCreateForm && (
            <View className="bg-base-100 rounded-xl px-5 py-6 items-center">
              <Text className="font-bold text-lg text-center mb-2">
                Nenhum dependente cadastrado
              </Text>
              <Text className="text-base-500 text-center mb-5">
                Adicione o primeiro dependente para começar a gerenciar os
                dados.
              </Text>
              <Button onPress={() => setShowCreateForm(true)} className="h-12">
                <Text>Adicionar dependente</Text>
              </Button>
            </View>
          )}

          {!loading &&
            !isEmptyState &&
            kids.map((kid, index) => renderItem({ dependent: kid, index }))}

          {showCreateForm && (
            <View className="bg-base-100 rounded-lg p-4">
              <RegisterKidForm
                onSubmit={handleCreateKidForm}
                submitLabel="Adicionar novo dependente"
                submittingLabel="Adicionando novo dependente..."
              />
            </View>
          )}

          {!loading && !isEmptyState && !showCreateForm && (
            <Button
              onPress={() => setShowCreateForm(true)}
              className="w-full"
              variant="default"
            >
              <Text>Novo dependente</Text>
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
