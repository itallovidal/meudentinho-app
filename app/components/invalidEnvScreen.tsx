import { ErrorScreen } from "@/components/errorScreen";
import { ErrorState } from "@/components/errorState";

interface InvalidEnvScreenProps {
  issues: string[];
}

export function InvalidEnvScreen({ issues }: InvalidEnvScreenProps) {
  return (
    <ErrorScreen>
      <ErrorState
        title="Configuração inválida"
        message={`Não foi possível ler as variáveis de ambiente do app:\n${issues
          .map((issue) => `• ${issue}`)
          .join("\n")}`}
      />
    </ErrorScreen>
  );
}
