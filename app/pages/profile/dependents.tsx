import { createKid, getAllKids } from "@/api/user/kids";
import { RegisterKidForm } from "@/components/forms/registerKidForm";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import { UserContext } from "@/contexts/UserContext";
import { getUserIdFromToken } from "@/lib/utils";
import { KidRequestDTO, KidResponseDTO } from "@/types/dtos/user";
import React, { useContext, useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";

export function Dependents() {
  const { authToken } = useContext(UserContext)!;
  const [loading, setLoading] = useState(true);
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
      console.error("Error fetching dependents:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmitKidForm(data: KidRequestDTO, index: number) {
    Alert.alert(
      "Ainda não implementado",
      "A edição de dependentes existentes ainda não foi implementada.",
    );
  }

  async function handleCreateKidForm(data: KidRequestDTO) {
    try {
      if (!authToken) {
        Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
        return;
      }

      const userId = getUserIdFromToken(authToken);
      await createKid({ ...data, parentId: userId }, userId, authToken);
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
              isPremature: dependent.isPremature,
              parentId: dependent.parentId,
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
        className="w-full px-4"
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
    if (!authToken) {
      setKids([]);
      return;
    }

    const userId = getUserIdFromToken(authToken);
    const { data } = await getAllKids(userId, authToken);
    setKids(data || []);
  }
}
