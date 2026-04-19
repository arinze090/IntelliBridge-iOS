/**
 * @format
 */

import 'react-native-gesture-handler';

import React from 'react';
import { AppRegistry, Platform, View, Text } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import Toast from 'react-native-toast-message';
import { PaystackProvider } from 'react-native-paystack-webview';
import { PAYSTACK_LIVE_PUBLIC_KEY } from '@env';

import { windowHeight, windowWidth } from './src/utils/Dimensions';
import { COLORS } from './src/themes/themes';

const RootApp = ({ isHeadless }) => {
  const toastConfig = {
    legacyBridgeToast: ({ text2 }) => (
      <View
        style={{
          height: Platform.OS == 'ios' ? windowHeight / 15 : 60,
          width: windowWidth / 1.1,
          backgroundColor: COLORS.legacyBridgePrimary,
          borderRadius: 5,
          justifyContent: 'center',
          alignContent: 'center',
          alignItems: 'center',
          padding: 10,
        }}
      >
        <Text style={{ color: 'black', fontSize: 15, fontWeight: '700' }}>
          {text2}
        </Text>
      </View>
    ),
  };

  return (
    <PaystackProvider
      publicKey={PAYSTACK_LIVE_PUBLIC_KEY}
      defaultChannels={[
        'card',
        'bank',
        'ussd',
        'qr',
        'mobile_money',
        'bank_transfer',
        'apple_pay',
      ]}
    >
      <App />
      <Toast config={toastConfig} />
    </PaystackProvider>
  );
};
AppRegistry.registerComponent(appName, () => RootApp);
