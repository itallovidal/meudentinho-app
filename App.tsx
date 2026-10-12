import "./global.css";
import { createStaticNavigation } from "@react-navigation/native";
import { enableScreens } from "react-native-screens";
import { PortalHost } from "@rn-primitives/portal";
import { TabNavigator } from "./app/navigation/TabNavigator";
import { UserProvider } from "./app/contexts/UserContext";
import { ErrorBoundary } from "./app/components/ErrorBoundary";
import { ToastProvider } from "./app/components/ui/toast";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { colorScheme } from "nativewind";
import { IconContext } from "phosphor-react-native";
import { THEME } from "@/lib/theme";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

enableScreens();

console.log(`[app] bundle loaded em ${new Date().toLocaleTimeString("pt-BR")}`);

const Navigation = createStaticNavigation(TabNavigator);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function App() {
  colorScheme.set("light");
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
                className="flex-1 bg-base-100"
              >
                <ToastProvider>
                  <ErrorBoundary>
                    <Navigation />
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
