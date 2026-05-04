import { createStaticNavigation } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import TabNavigator from './app/navigation/TabNavigator';

enableScreens();

const Navigation = createStaticNavigation(TabNavigator);

export default function App() {
  return <Navigation />;
}
