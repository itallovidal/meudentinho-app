import { View } from "react-native";
import { ErrorState } from "@/components/errorState";
import { Skeleton } from "@/components/ui/skeleton";

type FormLoadStateProps = {
  message?: string;
  onRetry?: () => void;
};

export function FormLoadState({ message, onRetry }: FormLoadStateProps) {
  return (
    <View className="w-full flex-1 gap-5 bg-base-100 p-6">
      {message ? (
        <ErrorState
          title="Não foi possível abrir o formulário"
          message={message}
          onRetry={onRetry}
        />
      ) : null}
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
    </View>
  );
}
