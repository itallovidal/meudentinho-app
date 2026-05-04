import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';

const TabNavigator = createBottomTabNavigator({
  initialRouteName: 'Home',
  screens: {
    Home,
    Login,
    Signup,
  },
});

export default TabNavigator;
