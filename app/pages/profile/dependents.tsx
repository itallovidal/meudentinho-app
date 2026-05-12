import { RegisterKidForm } from "@/components/forms/registerKidForm";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import { RequestKidDTO } from "@/types/dtos/kid";
import { useState } from "react";
import { Alert, ScrollView, View } from "react-native";

interface MockKid {
  id: string;
  name: string;
  birthDate: string;
  gender: "male" | "female";
  isPremature: boolean;
  prematureWeeks?: number;
}

const kidsMock = require("../../../mock/kids.json") as MockKid[];

function mapMockKidToFormValues(kid: MockKid): RequestKidDTO {
  return {
    name: kid.name,
    birthDate: kid.birthDate.split("T")[0],
    gender: kid.gender,
    isPremature: kid.isPremature,
    prematureWeeks: kid.prematureWeeks,
  };
}

export function Dependents() {
  const [formsVisibleCount, setFormsVisibleCount] = useState(1);

  function handleAddDependentForm() {
    setFormsVisibleCount((current) => {
      if (current >= kidsMock.length) {
        return current;
      }

      return current + 1;
    });
  }

  async function handleSubmitKidForm(data: RequestKidDTO, formIndex: number) {
    Alert.alert(
      "Dependente salvo",
      `Formulário ${formIndex + 1} enviado com sucesso.`,
    );
  }

  const visibleKids = kidsMock.slice(0, formsVisibleCount);
  const hasMoreMockKids = formsVisibleCount < kidsMock.length;

  return (
    <Wrapper
      className="bg-base-200 flex-1"
      direction="column"
      align="center"
      justify="start"
      gap="gap-0"
    >
      <Header hasBackButton />

      <ScrollView className="w-full px-4 py-4">
        <Wrapper direction="column" className="w-full" gap="gap-4">
          {visibleKids.map((kid, index) => (
            <View key={kid.id}>
              <Text className="font-bold mb-2">{kid.name}</Text>
              <View className="bg-base-100 rounded-lg p-4">
                <RegisterKidForm
                  onSubmit={(data) => handleSubmitKidForm(data, index)}
                  defaultValues={mapMockKidToFormValues(kid)}
                  submitLabel="Salvar dependente"
                  submittingLabel="Salvando dependente..."
                />
              </View>
            </View>
          ))}

          <Button
            onPress={handleAddDependentForm}
            disabled={!hasMoreMockKids}
            className="w-full mb-6"
            variant={hasMoreMockKids ? "default" : "secondary"}
          >
            <Text>
              {hasMoreMockKids
                ? "Adicionar formulário de outra criança"
                : "Todos os dependentes do mock já foram adicionados"}
            </Text>
          </Button>
        </Wrapper>
      </ScrollView>
    </Wrapper>
  );
}
