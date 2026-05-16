import React from "react";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import { Progress } from "@/components/ui/progress";

export default function TeethExchangeCard({
  total,
  exchanged,
  kidName,
}: {
  total: number;
  exchanged: number;
  kidName?: string;
}) {
  const percent = total > 0 ? Math.round((exchanged / total) * 100) : 0;
  const name = kidName || "Seu filho(a)";

  return (
    <Wrapper
      direction="column"
      align="center"
      justify="start"
      className="flex-1 w-full rounded-2xl bg-base-200 px-11 py-6"
    >
      <Text variant="h4" className="text-center text-primary-800">
        Troca de Dentes
      </Text>

      <Text className="mt-2 text-center text-sm text-base-500">
        {`${name} já trocou ${exchanged} de ${total} dentes de leite.`}
      </Text>

      <Progress
        value={percent}
        className="mt-4 h-2 w-52 bg-base-200"
        indicatorClassName="bg-primary-500"
      />

      <Wrapper className="mt-2" justify="center">
        <Text className="text-xs font-bold tracking-wide text-primary-500">
          {percent}% CONCLUÍDO
        </Text>
      </Wrapper>
    </Wrapper>
  );
}
