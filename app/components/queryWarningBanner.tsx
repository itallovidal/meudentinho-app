import { View } from "react-native";
import { WarningIcon } from "phosphor-react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";

type QueryWarningBannerProps = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function QueryWarningBanner({
  message,
  onRetry,
  retryLabel = "Tentar novamente",
}: QueryWarningBannerProps) {
  const colors = THEME.light;

  return (
    <View className="w-full flex-row items-center gap-3 rounded-xl border border-base-300 bg-base-100 px-4 py-3">
      <WarningIcon size={22} color={colors.primary500} weight="fill" />
      <Text className="flex-1 text-sm text-base-600">{message}</Text>
      {onRetry && (
        <Button variant="ghost" size="sm" onPress={onRetry}>
          <Text className="text-sm font-bold text-primary-500">
            {retryLabel}
          </Text>
        </Button>
      )}
    </View>
  );
}
