import "./global.css";
import { createStaticNavigation } from "@react-navigation/native";
import { enableScreens } from "react-native-screens";
import { PortalHost } from "@rn-primitives/portal";
import { RootNavigator } from "./app/navigation/RootNavigator";
import { webLinking } from "./app/navigation/linking";
import { webDocumentTitle } from "./app/navigation/documentTitle";
import { UserContext, UserProvider } from "./app/contexts/UserContext";
import { useContext, useEffect, useState } from "react";
import { ErrorBoundary } from "./app/components/ErrorBoundary";
import { ToastProvider } from "./app/components/ui/toast";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { colorScheme } from "nativewind";
import { IconContext } from "phosphor-react-native";
import { NAV_THEME, THEME } from "@/lib/theme";
import { envIssues } from "@/lib/env";
import { InvalidEnvScreen } from "@/components/invalidEnvScreen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Platform, View } from "react-native";
import { Skeleton } from "@/components/ui/skeleton";
import { configureWebStyles } from "@/lib/webStyles";

configureWebStyles();
enableScreens();

const Navigation = createStaticNavigation(RootNavigator);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
});

function SessionNavigation() {
  const { userId, hydrated } = useContext(UserContext)!;
  const [sessionBoundary, setSessionBoundary] = useState({
    userId,
    revision: 0,
  });
  if (sessionBoundary.userId !== userId) {
    setSessionBoundary({
      userId,
      revision: sessionBoundary.revision + (sessionBoundary.userId ? 1 : 0),
    });
  }

  if (!hydrated) {
    return (
      <View className="flex-1 gap-6 bg-base-100 p-6">
        <Skeleton className="h-12 w-40" />
        <Skeleton className="h-56 w-full rounded-3xl" />
        <Skeleton className="h-32 w-full rounded-3xl" />
      </View>
    );
  }
  return (
    <Navigation
      key={
        Platform.OS === "web" ? sessionBoundary.revision : (userId ?? "anon")
      }
      linking={webLinking}
      documentTitle={webDocumentTitle}
      theme={NAV_THEME.light}
    />
  );
}

export function App() {
  useEffect(function configureLightTheme() {
    colorScheme.set("light");
  }, []);

  if (envIssues.length > 0) {
    return <InvalidEnvScreen issues={envIssues} />;
  }

  const colors = THEME.light;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <IconContext.Provider
            value={{ color: colors.base600, size: 24, weight: "fill" }}
          >
            <UserProvider>
              <SafeAreaView
                edges={["top", "left", "right"]}
                className="w-full flex-1 bg-base-100 web:mx-auto web:max-w-5xl"
              >
                <ToastProvider>
                  <ErrorBoundary>
                    <SessionNavigation />
                  </ErrorBoundary>
                </ToastProvider>
              </SafeAreaView>
            </UserProvider>
          </IconContext.Provider>
          <PortalHost />
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
