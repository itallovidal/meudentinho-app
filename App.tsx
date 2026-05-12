import "./global.css";
import { createStaticNavigation } from "@react-navigation/native";
import { enableScreens } from "react-native-screens";
import { PortalHost } from "@rn-primitives/portal";
import { TabNavigator } from "./app/navigation/TabNavigator";
import { UserProvider } from "./app/contexts/UserContext";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { colorScheme } from "nativewind";
import { IconContext } from "phosphor-react-native";
import { THEME } from "@/lib/theme";
enableScreens();

const Navigation = createStaticNavigation(TabNavigator);

export default function App() {
  colorScheme.set("light");
  const colors = THEME.light;

  return (
    <SafeAreaProvider>
      <IconContext.Provider
        value={{ color: colors.base600, size: 24, weight: "fill" }}
      >
        <UserProvider>
          <SafeAreaView className="flex-1 bg-base-100">
            <Navigation />
          </SafeAreaView>
        </UserProvider>
      </IconContext.Provider>
      <PortalHost />
    </SafeAreaProvider>
  );
}
