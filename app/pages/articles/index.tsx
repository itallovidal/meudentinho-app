import { Wrapper } from "@/components/wrapper";
import { Header } from "@/components/header";
import { View } from "react-native";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import Entypo from "@expo/vector-icons/Entypo";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Card } from "@/components/card";

const buttons = ["Dentição", "Alimentação", "Higiene Oral"];

// TODO: Refatorar para deixar mais simples e criar um componente para os cards dos artigos, para evitar repetição de código e facilitar a manutenção.
export function Index() {
  const [selectedButton, setSelectedButton] = useState(buttons[0]);

  return (
    <Wrapper
      className="bg-base-100 flex-1"
      direction="column"
      align="center"
      justify="start"
    >
      <Header />
      <Wrapper
        className="flex-1 w-full px-6 py-4 bg-base-200"
        direction="column"
        align="center"
        justify="start"
      >
        <View className="relative w-full">
          <Input
            placeholder="Buscar artigos e guias"
            className="bg-base-100 pr-12"
          />
          <View className="absolute right-3 top-1/2 -translate-y-1/2">
            <Text className="text-base-500 text-2xl">⌕</Text>
          </View>
        </View>
        <Wrapper
          className="w-full mt-4 flex-wrap"
          direction="row"
          align="start"
          justify="start"
        >
          {buttons.map((button, index) => (
            <Button
              variant={selectedButton === button ? "default" : "outline"}
              size="lg"
              className="mb-2"
              key={index}
              onPress={() => setSelectedButton(button)}
            >
              <Text variant="h4">{button}</Text>
            </Button>
          ))}
        </Wrapper>
        <View className="mt-6 w-full overflow-hidden rounded-3xl bg-primary-500 px-5 py-6">
          <Badge
            variant="outline"
            className="mb-4 self-start border-base-100/20 bg-base-100/10 px-3 py-1"
          >
            <Text variant="small" className="text-base-100">
              Destaque
            </Text>
          </Badge>
          <Text variant="h2" className="text-base-100 border-0 pb-0">
            O Guia Completo da Regra dos 6 Anos
          </Text>
          <View className="mt-2 flex-row items-center gap-2">
            <Entypo name="back-in-time" size={20} color="white" />
            <Text variant="small" className="text-base-100/90">
              5 min de leitura
            </Text>
          </View>
        </View>
        <Text variant="h3" className="mt-6 self-start">
          Hábitos Orais
        </Text>
        <Card
          category="Higiene Oral"
          title="Respiração Bucal: Sinais de alerta"
        />
        <Text variant="h3" className="mt-6 self-start">
          Primeira Consulta
        </Text>
        <Card
          category="Dentição"
          title="Primeira Consulta: O que esperar e como se preparar"
        />

        <Button variant="default" size="lg" className="mt-6">
          <AntDesign name="plus" size={18} color="white" />
          <Text variant="h4">Criar Artigo</Text>
        </Button>
      </Wrapper>
    </Wrapper>
  );
}
