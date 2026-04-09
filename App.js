import React from 'react';
import { LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as ReduxStoreProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './src/redux/store';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigation from './src/navigation/AppNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import { ThemeProvider } from './src/Context/ThemeContext';

LogBox.ignoreAllLogs();

function App({}) {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <ReduxStoreProvider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <NavigationContainer>
              <MainNavigator />
            </NavigationContainer>
          </PersistGate>
        </ReduxStoreProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

export default App;
