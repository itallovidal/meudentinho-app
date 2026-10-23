import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";
import { ArrowsClockwiseIcon, CaretLeftIcon } from "phosphor-react-native";
import { Image, View } from "react-native";

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
  const colors = THEME.light;
  const isBackAction = retryLabel?.toLowerCase().startsWith("voltar") ?? false;

  return (
    <View className="w-full items-center rounded-3xl bg-base-100 px-6 pb-6 pt-6 shadow-lg shadow-base-300">
      <Image
        source={require("../../assets/tryagain.png")}
        className="mb-2 h-32 w-36"
        resizeMode="contain"
        accessibilityLabel="Dente sem conexão com a internet"
      />
      <Text className="mb-2 text-center text-2xl font-extrabold text-primary-800">
        {title}
      </Text>
      <Text className="mb-6 text-center text-base text-base-500">
        {message}
      </Text>
      {onRetry && (
        <Button
          onPress={onRetry}
          className="h-14 w-full rounded-full bg-primary-800"
        >
          {isBackAction && (
            <CaretLeftIcon size={20} color={colors.base100} weight="bold" />
          )}
          {!isBackAction && (
            <ArrowsClockwiseIcon
              size={20}
              color={colors.base100}
              weight="bold"
            />
          )}
          <Text className="text-base font-bold">{retryLabel}</Text>
        </Button>
      )}
    </View>
  );
}
