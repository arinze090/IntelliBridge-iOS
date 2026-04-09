import { ActivityIndicator, StyleSheet, View } from 'react-native';
import React from 'react';
import WebView from 'react-native-webview';
import HeaderTitle from '../../components/common/HeaderTitle';
import SafeAreaViewComponent from '../../components/common/SafeAreaViewComponent';
import { COLORS } from '../../themes/themes';

const FAQsScreen = ({ navigation }) => {
  return (
    <SafeAreaViewComponent>
      <HeaderTitle
        leftIcon={'chevron-back-outline'}
        headerTitle={'FAQs'}
        onLeftIconPress={() => {
          navigation.goBack();
        }}
      />
      <WebView
        source={{ uri: 'https://legacybridgepublishing.com/faqs/' }}
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

export default FAQsScreen;

const styles = StyleSheet.create({});
