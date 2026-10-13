import { KidCard } from "@/components/dependents/kidCard";
import { KidsListStatus } from "@/components/dependents/kidsListStatus";
import { Header } from "@/components/header";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import { UserContext } from "@/contexts/UserContext";
import { useKids } from "@/hooks/useKids";
import { ProfileNavegationProp } from "@/navigation/ProfileStack";
import { KidResponseDTO } from "@/types/dtos/user";
import { useNavigation } from "@react-navigation/native";
import { PlusIcon } from "phosphor-react-native";
import { useContext, useEffect } from "react";
import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

export function Dependents() {
  const { authToken, hydrated } = useContext(UserContext)!;
  const navigation = useNavigation<ProfileNavegationProp>();

  const { kids, isLoading, isRefreshing, failure, refetch } =
    useKids(authToken);

  const isEmptyState = !isLoading && !failure && kids.length === 0;
  const showKidList = !isLoading && !failure && kids.length > 0;

  useEffect(() => {
    if (hydrated && !authToken) {
      navigation.navigate("Login");
    }
  }, [hydrated, authToken, navigation]);

  function handleLoginAgain() {
    navigation.navigate("Login");
  }

  function handleSelectKid(kid: KidResponseDTO) {
    navigation.navigate("EditDependent", { kid });
  }

  function handleCreateKid() {
    navigation.navigate("EditDependent");
  }

  if (!hydrated) {
    return (
      <Wrapper
        className="flex-1 bg-base-200"
        direction="column"
        align="center"
        justify="start"
        gap="gap-0"
      >
        <Header hasBackButton />
        <Text>Carregando...</Text>
      </Wrapper>
    );
  }

  if (!authToken) {
    return null;
  }

  return (
    <Wrapper
      className="flex-1 bg-base-200"
      direction="column"
      align="center"
      justify="start"
      gap="gap-0"
    >
      <Header hasBackButton />

      <View className="relative w-full flex-1">
        <ScrollView
          className="w-full px-6"
          contentContainerStyle={{ flexGrow: 1, paddingVertical: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => void refetch()}
            />
          }
        >
          <Wrapper direction="column" className="w-full" gap="gap-4">
            <>
              <Wrapper direction="column" gap="gap-1">
                <Text
                  variant="h2"
                  className={`mb-0 ${isEmptyState ? "text-center" : ""}`}
                >
                  Dependentes
                </Text>
                <Text
                  className={`text-muted ${isEmptyState ? "text-center" : ""}`}
                >
                  {isEmptyState
                    ? "Adicione o primeiro dependente para começar."
                    : "Toque em um dependente para editar os dados."}
                </Text>
              </Wrapper>

              <KidsListStatus
                loading={isLoading}
                failure={failure}
                isEmpty={isEmptyState}
                onRetry={() => void refetch()}
                onLoginAgain={handleLoginAgain}
              />

              {showKidList &&
                kids.map((kid) => (
                  <KidCard key={kid.id} kid={kid} onPress={handleSelectKid} />
                ))}
            </>
          </Wrapper>
        </ScrollView>

        {!isLoading && !failure && (
          <TouchableOpacity
            onPress={handleCreateKid}
            activeOpacity={0.8}
            accessibilityLabel="Novo dependente"
            className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-black/20"
          >
            <PlusIcon size={24} weight="bold" color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </Wrapper>
  );
}
