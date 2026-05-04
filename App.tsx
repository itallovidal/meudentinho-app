import './global.css';
import { createStaticNavigation } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import { PortalHost } from '@rn-primitives/portal';
import { TabNavigator } from './app/navigation/TabNavigator';
import { UserProvider } from './app/contexts/UserContext';

enableScreens();

const Navigation = createStaticNavigation(TabNavigator);

export default function App() {
  return (
    <UserProvider>
      <Navigation />
      <PortalHost />
    </UserProvider>
  );
}
