import { useContext, useState } from "react";
import { ApiError } from "@/types/domain";
import { Alert, RefreshControl, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { TabNavigatorNavigationProp } from "@/navigation/TabNavigator";
import { UserContext } from "@/contexts/UserContext";
import { useKidMutations } from "@/hooks/useKidMutations";
import { ArticleListSection } from "@/components/article/articleListSection";
import { ErrorState } from "@/components/errorState";
import { QueryWarningBanner } from "@/components/queryWarningBanner";
import { useArticles } from "@/hooks/useArticles";
import { useKids } from "@/hooks/useKids";
import { useKidsSmileSummaries } from "@/hooks/useKidsSmileSummaries";
import { KidsSmileCarousel } from "@/components/home/kidsSmileCarousel";
import { SkeletonKidsSmileCarousel } from "@/skeletons/components/skeletonKidsSmileCarousel";
import { Wrapper } from "@/components/wrapper";
import { Header } from "@/components/header";
import { KidFormValues } from "@/lib/schemas/kid";
import { errorMessage } from "@/lib/errorMessage";
import { buildKidRequest } from "@/lib/privacyPolicy";
import { RegisterKidSection } from "@/components/home/registerKidSection";
import { useToast } from "@/components/ui/toast";
import { SessionCard } from "@/components/sessionCard";
import { SessionNotice } from "@/components/sessionNotice";

const HOME_VISIBLE_ARTICLES = 4;

export function Home() {
  const navigation = useNavigation<TabNavigatorNavigationProp>();
  const [registerKidError, setRegisterKidError] = useState<ApiError | null>(
    null,
  );
  const { authToken, hydrated, sessionExpired, expireSession } =
    useContext(UserContext)!;
  const { showToast } = useToast();

  const {
    isRefreshing,
    onRefresh,
    articles,
    latestArticle,
    isLoading,
    isError,
    refetchError: articlesRefetchError,
  } = useArticles();

  const {
    kids,
    isLoading: kidsPending,
    failure: kidsFailure,
    refetch: refetchKids,
    isRefreshing: kidsRefreshing,
    refetchError: kidsRefetchError,
  } = useKids(authToken);

  const {
    items: smileSummaries,
    isLoading: smilePending,
    isError: smileError,
    refetch: refetchSmile,
  } = useKidsSmileSummaries(kids, authToken);

  const showOnboarding =
    hydrated &&
    !!authToken &&
    !kidsPending &&
    !kidsFailure &&
    kids.length === 0;

  const showKidsError =
    hydrated && !!authToken && !kidsPending && kidsFailure !== null;

  const showSmileCarousel = hydrated && !!authToken && kids.length > 0;

  const { createKidMutation } = useKidMutations(authToken);

  async function onRegisterKid(kidDTO: KidFormValues) {
    if (createKidMutation.isPending) {
      return;
    }
    try {
      if (!authToken) {
        Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
        return;
      }

      await createKidMutation.mutateAsync(await buildKidRequest(kidDTO));

      setRegisterKidError(null);
      showToast("Dependente cadastrado com sucesso.");
    } catch (error) {
      if (error instanceof ApiError) {
        setRegisterKidError(error);
        return;
      }
      setRegisterKidError(
        new ApiError(
          errorMessage(
            error,
            "Não foi possível cadastrar o dependente. Verifique sua conexão e tente novamente.",
          ),
          "NETWORK_ERROR",
        ),
      );
    }
  }

  async function handleRefresh() {
    if (!authToken) {
      await onRefresh();
      return;
    }
    await Promise.all([onRefresh(), refetchKids(), refetchSmile()]);
  }

  function openKidSmile(kidId: string) {
    navigation.navigate("Smile", {
      screen: "SmileHome",
      initial: false,
      pop: true,
      params: { kidId },
    });
  }

  function openKidHistory(kidId: string) {
    navigation.navigate("Smile", {
      screen: "SmileHistory",
      initial: false,
      params: { kidId, fromTab: "Home" },
    });
  }

  function goToLogin() {
    navigation.navigate("Profile", {
      screen: "Login",
      initial: false,
      params: { fromTab: "Home" },
    });
  }

  function goToSignup() {
    navigation.navigate("Profile", {
      screen: "Signup",
      initial: false,
      params: { fromTab: "Home" },
    });
  }

  return (
    <Wrapper
      direction="column"
      align="start"
      justify="start"
      className="flex-1"
    >
      <Header />
      <ScrollView
        className="w-full flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing || kidsRefreshing}
            onRefresh={() => void handleRefresh()}
          />
        }
      >
        <Wrapper
          className="mx-6 mb-4 mt-2 flex-1"
          direction="column"
          align="start"
          justify="start"
          gap="gap-4"
        >
          {hydrated && showOnboarding && (
            <RegisterKidSection
              onRegisterKid={onRegisterKid}
              registerKidError={registerKidError}
              isPending={createKidMutation.isPending}
            />
          )}

          {hydrated && showKidsError && kidsFailure !== "auth" && !isError && (
            <ErrorState onRetry={() => void refetchKids()} />
          )}

          {hydrated && showKidsError && kidsFailure !== "auth" && isError && (
            <ErrorState onRetry={() => void handleRefresh()} />
          )}

          {hydrated && showKidsError && kidsFailure === "auth" && (
            <Wrapper className="mt-4 w-full">
              <SessionNotice
                title="Sessão expirada"
                message="Faça login novamente para cadastrar o dependente."
                actionLabel="Entrar"
                onAction={() => void expireSession()}
              />
            </Wrapper>
          )}

          {hydrated && kidsRefetchError && (
            <QueryWarningBanner
              message="Não foi possível atualizar os dependentes. Mostrando a lista carregada anteriormente."
              onRetry={() => void refetchKids()}
            />
          )}

          {hydrated && !authToken && (
            <Wrapper className="mb-2 mt-4 w-full">
              {sessionExpired ? (
                <SessionNotice
                  title="Sessão expirada"
                  message="Entre novamente para continuar de onde parou."
                  actionLabel="Entrar"
                  onAction={goToLogin}
                />
              ) : (
                <SessionCard
                  title="Bem-vindo!"
                  message="Acompanhe a saúde bucal do seu filho."
                  actionLabel="Entrar"
                  onAction={goToLogin}
                  secondaryLabel="Criar conta"
                  onSecondary={goToSignup}
                />
              )}
            </Wrapper>
          )}

          {showSmileCarousel && (smilePending || smileError) && (
            <Wrapper
              direction="column"
              align="start"
              justify="start"
              className="w-full"
              gap="gap-4"
            >
              {smileError && (
                <ErrorState
                  message="Não foi possível carregar o resumo do sorriso dos dependentes."
                  onRetry={() => void refetchSmile()}
                />
              )}
              <SkeletonKidsSmileCarousel itemCount={kids.length} />
            </Wrapper>
          )}

          {showSmileCarousel && !smilePending && !smileError && (
            <KidsSmileCarousel
              items={smileSummaries}
              onOpenKid={openKidSmile}
              onOpenHistory={openKidHistory}
              onRegisterEvent={openKidSmile}
            />
          )}

          <Wrapper
            direction="column"
            align="start"
            justify="start"
            className="w-full"
          >
            <ArticleListSection
              articles={articles.slice(0, HOME_VISIBLE_ARTICLES)}
              latestArticle={latestArticle}
              isLoading={isLoading}
              isError={isError}
              refetchError={articlesRefetchError}
              hideError={showKidsError && kidsFailure !== "auth" && isError}
              onRetry={onRefresh}
              fromTab="Home"
            />
          </Wrapper>
        </Wrapper>
      </ScrollView>
    </Wrapper>
  );
}
