import { useEffect, useRef, useState, type ReactNode } from "react";
import { Image, View } from "react-native";
import {
  CheckCircleIcon,
  ImageIcon,
  WarningCircleIcon,
} from "phosphor-react-native";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";

export type ImagePreviewStatus = "loading" | "loaded" | "error";

type ImageUrlPreviewProps = {
  url: string | null;
  action?: ReactNode;
  accessibilityLabel: string;
  onStatusChange: (url: string, status: ImagePreviewStatus) => void;
};

export function ImageUrlPreview({
  url,
  action,
  accessibilityLabel,
  onStatusChange,
}: ImageUrlPreviewProps) {
  const [status, setStatus] = useState<ImagePreviewStatus>("loading");
  const [attempt, setAttempt] = useState(0);
  const [showImage, setShowImage] = useState(false);
  const request = useRef({ attempt: 0, settled: false });
  const colors = THEME.light;

  useEffect(() => {
    if (url) onStatusChange(url, status);
  }, [url, status, onStatusChange]);

  useEffect(() => {
    if (!url) return;
    const debounce = setTimeout(() => setShowImage(true), 350);
    const timeout = setTimeout(() => {
      request.current.settled = true;
      setStatus((current) => (current === "loading" ? "error" : current));
    }, 15000);
    return () => {
      clearTimeout(debounce);
      clearTimeout(timeout);
    };
  }, [url, attempt]);

  function finishRequest(nextStatus: "loaded" | "error") {
    if (request.current.attempt !== attempt || request.current.settled) return;
    request.current.settled = true;
    setStatus(nextStatus);
  }

  function retry() {
    request.current = { attempt: attempt + 1, settled: false };
    setShowImage(false);
    setStatus("loading");
    setAttempt((current) => current + 1);
  }

  return (
    <View className="w-full gap-3">
      <View className="aspect-video w-full overflow-hidden rounded-2xl border border-base-200 bg-base-200">
        {url && showImage && status !== "error" && (
          <Image
            key={attempt}
            source={{ uri: url }}
            resizeMode="cover"
            accessibilityLabel={accessibilityLabel}
            className="absolute inset-0 h-full w-full"
            onLoad={() => finishRequest("loaded")}
            onError={() => finishRequest("error")}
          />
        )}
        {(!url || status !== "loaded") && (
          <View className="absolute inset-0 items-center justify-center gap-2 p-4">
            {url && (
              <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
            )}
            {status === "error" && url ? (
              <WarningCircleIcon size={30} color={colors.destructive} />
            ) : (
              <ImageIcon size={30} color={colors.primary400} />
            )}
            <Text className="text-center text-xs leading-5 text-primary-700">
              {!url
                ? "Adicione uma URL válida para visualizar a imagem."
                : status === "error"
                  ? "Prévia indisponível"
                  : "Carregando imagem..."}
            </Text>
          </View>
        )}
        {action && <View className="absolute right-3 top-3">{action}</View>}
      </View>
      {url && status === "loaded" && (
        <View
          accessibilityLiveRegion="polite"
          className="flex-row items-center gap-2"
        >
          <CheckCircleIcon size={16} color={colors.primary500} />
          <Text className="flex-1 text-xs text-primary-700">
            Imagem carregada com sucesso.
          </Text>
        </View>
      )}
      {url && status === "error" && (
        <View className="gap-2">
          <Text
            accessibilityRole="alert"
            className="text-xs leading-5 text-destructive"
          >
            Não foi possível carregar esta imagem. Confira o link ou tente
            novamente.
          </Text>
          <Button
            variant="outline"
            onPress={retry}
            accessibilityLabel="Tentar carregar imagem novamente"
            className="self-start rounded-xl"
          >
            <Text>Tentar novamente</Text>
          </Button>
        </View>
      )}
    </View>
  );
}
