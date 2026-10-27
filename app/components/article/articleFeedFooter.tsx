import { ActivityIndicator, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";

type ArticleFeedFooterProps = {
  isError: boolean;
  isLoading: boolean;
  hasNextPage: boolean;
  hasArticles: boolean;
  onLoadMore: () => void;
};

export function ArticleFeedFooter({
  isError,
  isLoading,
  hasNextPage,
  hasArticles,
  onLoadMore,
}: ArticleFeedFooterProps) {
  return (
    <View className="w-full items-center gap-2 py-4">
      {isLoading ? (
        <ActivityIndicator color={THEME.light.primary500} />
      ) : isError || hasNextPage ? (
        <>
          {isError && (
            <Text
              accessibilityRole="alert"
              className="text-sm text-destructive"
            >
              Não foi possível carregar mais artigos.
            </Text>
          )}
          <Button variant="outline" onPress={onLoadMore}>
            <Text>
              {isError ? "Tentar novamente" : "Carregar mais artigos"}
            </Text>
          </Button>
        </>
      ) : hasArticles ? (
        <Text className="text-sm text-muted-foreground">
          Você chegou ao fim dos artigos
        </Text>
      ) : null}
    </View>
  );
}
