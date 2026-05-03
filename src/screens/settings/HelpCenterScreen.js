import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSelector } from 'react-redux';

import SafeAreaViewComponent from '../../components/common/SafeAreaViewComponent';
import HeaderTitle from '../../components/common/HeaderTitle';
import { useTheme } from '../../Context/ThemeContext';

export default function HelpCenter({ navigation }) {
  const { isDarkMode, theme } = useTheme();

  const CRISP_WEBSITE_ID = process.env.CRISP_WEBSITE_ID;
  //   console.log('CRISP_WEBSITE_ID:', CRISP_WEBSITE_ID);

  const state = useSelector(state => state);
  const loggedInUser = state?.user?.user;

  return (
    <SafeAreaViewComponent>
      <HeaderTitle
        headerTitle={'Help Center'}
        onLeftIconPress={() => navigation.goBack()}
        leftIcon="arrow-back-outline"
      />

      <View style={{ padding: 4 }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: '600',
            marginBottom: 10,
            color: theme?.text,
            textAlign: 'center',
          }}
        >
          Hello 👋 {loggedInUser?.username}, How can we help you today?
        </Text>

        <Text
          style={{ color: theme?.text, marginBottom: 10, textAlign: 'center' }}
        >
          Chat with our support team or explore common issues below.
        </Text>
      </View>

      <WebView
        originWhitelist={['*']}
        source={{
          html: generateCrispHTML(
            CRISP_WEBSITE_ID,
            loggedInUser?.email,
            loggedInUser?.fullname,
            isDarkMode,
            theme,
          ),
          baseUrl: 'https://localhost',
        }}
        javaScriptEnabled
        domStorageEnabled
      />
    </SafeAreaViewComponent>
  );
}

function generateCrispHTML(
  websiteId,
  userEmail,
  userFullName,
  isDarkMode,
  theme,
) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script type="text/javascript">
      window.$crisp = [];
      window.CRISP_WEBSITE_ID = "${websiteId}";
      window.$crisp.push(["set", "user:email", ["${userEmail}"]]);
      window.$crisp.push(["set", "user:nickname", ["${userFullName}"]]);

      (function() {
        var d = document;
        var s = d.createElement("script");
        s.src = "https://client.crisp.chat/l.js";
        s.async = 1;
        d.getElementsByTagName("head")[0].appendChild(s);
      })();

      window.$crisp.push(["config", "color:theme", ["${
        isDarkMode ? 'dark' : 'light'
      }"]]);

      window.$crisp.push(["do", "chat:show"]);


     // Auto open chat AFTER it's ready
      window.CRISP_READY_TRIGGER = function() {
        setTimeout(function() {
          window.$crisp.push(["do", "chat:open"]);
        }, 500); 
      };

    </script>
  </head>
  <body style="background-color: ${theme?.background}; color: ${theme?.text};">
  </body>
</html>
`;
}

const styles = StyleSheet.create({});
