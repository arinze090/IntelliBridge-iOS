import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import EmailVerificationScreen from '../screens/auth/EmailVerificationScreen';
import ForgetPassword from '../screens/auth/ForgetPassword';
import ResetPassword from '../screens/auth/ResetPassword';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import OnboardingScreen from '../screens/auth/OnboardingScreen';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  const state = useSelector(state => state);
  const reduxLaunchScreen = state?.user?.launchScreen;

  const [loading, setLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  // To show the onboarding screen on just first launch
  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      AsyncStorage.getItem('alreadyLaunched').then(value => {
        console.log('launchVal', value);
        if (value === null) {
          AsyncStorage.setItem('alreadyLaunched', 'true');
          setIsFirstLaunch(true);
          console.log('isFirstLaunch');
        } else {
          setIsFirstLaunch(false);
          console.log('notIsFirstLaunch');
        }
      });

      AppState.addEventListener('change', state =>
        console.log('AppState changed to', state),
      );
    }
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setLoading(reduxLaunchScreen);
    setIsFirstLaunch(false);

    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, [reduxLaunchScreen]);

  if (isFirstLaunch === null) {
    return null;
  } else if (isFirstLaunch === true) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    );
  } else {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {loading ? (
          <Stack.Screen name="Splash" component={SplashScreen} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen
              name="EmailVerification"
              component={EmailVerificationScreen}
            />
            <Stack.Screen name="ForgetPassword" component={ForgetPassword} />
            <Stack.Screen name="ResetPassword" component={ResetPassword} />
          </>
        )}
      </Stack.Navigator>
    );
  }
};

export default AuthStack;
