import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { View } from "react-native";
import { ErrorState } from "@/components/errorState";
import type { RootNavigatorParamList } from "@/navigation/RootNavigator";

export function NotFound() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootNavigatorParamList>>();

  return (
    <View className="flex-1 justify-center bg-base-200 px-6">
      <ErrorState
        title="Página não encontrada"
        message="Este endereço não está disponível. Você pode continuar pela página inicial."
        retryLabel="Ir para o início"
        onRetry={() =>
          navigation.reset({ index: 0, routes: [{ name: "Main" }] })
        }
      />
    </View>
  );
}
