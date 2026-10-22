import { KidCard } from "@/components/dependents/kidCard";
import { KidsListStatus } from "@/components/dependents/kidsListStatus";
import { Header } from "@/components/header";
import { QueryWarningBanner } from "@/components/queryWarningBanner";
import { FloatingActionButton } from "@/components/ui/floatingActionButton";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";
import { UserContext } from "@/contexts/UserContext";
import { useKids } from "@/hooks/useKids";
import { THEME } from "@/lib/theme";
import { ProfileNavegationProp } from "@/navigation/ProfileStack";
import type { KidResponseDTO } from "@/types/dtos/user";
import { useNavigation } from "@react-navigation/native";
import { PlusIcon } from "phosphor-react-native";
import { useContext, useEffect } from "react";
import { RefreshControl, ScrollView, View } from "react-native";

export function Dependents() {
  const { authToken, hydrated } = useContext(UserContext)!;
  const navigation = useNavigation<ProfileNavegationProp>();
  const colors = THEME.light;

  const { kids, isLoading, isRefreshing, failure, refetchError, refetch } =
    useKids(authToken);

  const isEmptyState = !isLoading && !failure && kids.length === 0;
  const showKidList = !isLoading && !failure && kids.length > 0;

  useEffect(() => {
    if (hydrated && !authToken) {
      navigation.replace("Login");
    }
  }, [hydrated, authToken, navigation]);

  function handleLoginAgain() {
    navigation.replace("Login");
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
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: 16,
            paddingBottom: 104,
          }}
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

              {refetchError && (
                <QueryWarningBanner
                  message="Não foi possível atualizar os dependentes. Mostrando a lista carregada anteriormente."
                  onRetry={() => void refetch()}
                />
              )}

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
          <FloatingActionButton
            accessibilityLabel="Novo dependente"
            onPress={handleCreateKid}
            icon={
              <PlusIcon
                size={24}
                weight="bold"
                color={colors.primaryForeground}
              />
            }
          />
        )}
      </View>
    </Wrapper>
  );
}
