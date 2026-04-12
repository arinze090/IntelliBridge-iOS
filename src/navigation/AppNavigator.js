import React, { useEffect, useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';

import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { COLORS } from '../themes/themes';
import CustomDrawer from '../components/common/CustomDrawer';
import MainScreen from '../screens/MainScreen';
import SplashScreen from '../screens/SplashScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const AppNavigation = () => {
  const dispatch = useDispatch();
  const state = useSelector(state => state);
  const reduxLaunchScreen = state?.user?.launchScreen;

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(reduxLaunchScreen);

    // Set isLoading to false after 3 seconds
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    // Cleanup the timeout to avoid potential memory leaks
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      // ref={navigationRef}
      // drawerContent={props => <CustomDrawer {...props} />}
      // screenOptions={{
      //   drawerLabelStyle: {
      //     marginLeft: -15,
      //   },
      //   drawerActiveBackgroundColor: COLORS.black,
      //   drawerActiveTintColor: 'white',
      //   drawerInactiveTintColor: COLORS.btnBorderColor,
      // }}
      // headerMode="none"
    >
      {isLoading ? (
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{
            headerShown: false,
          }}
        />
      ) : (
        <Stack.Screen
          name="Home"
          component={MainScreen}
          options={{
            headerShown: false,
            drawerIcon: ({ color }) => (
              <Ionicons name="home-outline" color={color} size={22} />
            ),
          }}
        />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigation;
