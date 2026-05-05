import './global.css';
import { createStaticNavigation } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import { PortalHost } from '@rn-primitives/portal';
import { TabNavigator } from './app/navigation/TabNavigator';
import { UserProvider } from './app/contexts/UserContext';
import { SafeAreaView } from 'react-native-safe-area-context';

enableScreens();

const Navigation = createStaticNavigation(TabNavigator);

export default function App() {
  return (
    <UserProvider>
      <SafeAreaView className="flex-1">
        <Navigation />
      </SafeAreaView>
      <PortalHost />
    </UserProvider>
  );
}
