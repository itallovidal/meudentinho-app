import React from "react";
import { Card } from "@/components/card";
import { Text } from "@/components/ui/text";
import { View } from "react-native";
import { Wrapper } from "../wrapper";

export default function TeethExchangeCard({
  total,
  exchanged,
}: {
  total: number;
  exchanged: number;
}) {
  const percent = Math.round((exchanged / total) * 100);
  return (
    <Card icon={<Text>🔁</Text>} title="Troca de Dentes">
      <Text>{`Já trocou ${exchanged} de ${total} dentes de leite.`}</Text>
      <View
        style={{
          height: 12,
          backgroundColor: "#eee",
          borderRadius: 6,
          marginTop: 8,
        }}
      >
        <View
          style={{
            width: `${percent}%`,
            height: "100%",
            backgroundColor: "#0b1b2b",
            borderRadius: 6,
          }}
        />
      </View>
      <Wrapper className="mt-2">
        <Text>{percent}% CONCLUÍDO</Text>
      </Wrapper>
    </Card>
  );
}
