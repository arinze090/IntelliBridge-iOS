import { ActivityIndicator, StyleSheet, View } from 'react-native';
import React from 'react';
import WebView from 'react-native-webview';
import HeaderTitle from '../../components/common/HeaderTitle';
import SafeAreaViewComponent from '../../components/common/SafeAreaViewComponent';
import { COLORS } from '../../themes/themes';

const AboutUsScreen = ({ navigation }) => {
  return (
    <SafeAreaViewComponent style={{ flex: 1 }}>
      <HeaderTitle
        leftIcon={'chevron-back-outline'}
        headerTitle={'About Us'}
        onLeftIconPress={() => {
          navigation.goBack();
        }}
      />
      <WebView
        source={{ uri: 'https://legacybridgepublishing.com/about-us/' }}
        style={{ height: '100%' }}
        startInLoadingState={true}
        renderLoading={() => (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ActivityIndicator
              size="large"
              color={COLORS.legacyBridgePrimary}
            />
          </View>
        )}
      />
    </SafeAreaViewComponent>
  );
};

export default AboutUsScreen;

const styles = StyleSheet.create({});
