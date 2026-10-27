import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Illustration } from "@/components/illustration";
import { THEME } from "@/lib/theme";
import { View } from "react-native";

interface ErrorStateProps {
  onRetry?: () => void;
  title?: string;
  message?: string;
  retryLabel?: string;
}

export function ErrorState({
  onRetry,
  title = "Ops! Não conseguimos carregar",
  message = "Parece que a conexão caiu. Que tal dar uma olhadinha na sua internet?",
  retryLabel = "Tentar novamente",
}: ErrorStateProps) {
  return (
    <View className="w-full min-w-0 shrink-0 items-center rounded-3xl bg-base-100 px-6 pb-4 shadow-lg shadow-base-300">
      <Illustration
        source={require("../../assets/tryagain.png")}
        width={144}
        height={128}
        accessibilityLabel="Dente sem conexão com a internet"
      />
      <Text className="mb-2 text-center text-2xl font-extrabold text-primary-800">
        {title}
      </Text>
      <Text className="mb-4 text-center text-base text-muted-foreground">
        {message}
      </Text>
      {onRetry && (
        <Button
          onPress={onRetry}
          className="h-14 w-full rounded-full bg-primary-800"
        >
          <Text
            style={{ textAlign: "center", width: "100%" }}
            className="flex-1 text-center text-base font-bold"
          >
            {retryLabel}
          </Text>
        </Button>
      )}
    </View>
  );
}
