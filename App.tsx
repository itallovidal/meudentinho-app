import "./global.css";
import { createStaticNavigation } from "@react-navigation/native";
import { enableScreens } from "react-native-screens";
import { PortalHost } from "@rn-primitives/portal";
import { TabNavigator } from "./app/navigation/TabNavigator";
import { UserProvider } from "./app/contexts/UserContext";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { colorScheme } from "nativewind";

enableScreens();

const Navigation = createStaticNavigation(TabNavigator);

export default function App() {
  colorScheme.set("light");

  return (
    <SafeAreaProvider>
      <UserProvider>
        <SafeAreaView className="flex-1 bg-base-100">
          <Navigation />
        </SafeAreaView>
        <PortalHost />
      </UserProvider>
    </SafeAreaProvider>
  );
}
