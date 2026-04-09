import { Image, StyleSheet, Text, View } from 'react-native';
import React from 'react';

import SafeAreaViewComponent from '../../components/common/SafeAreaViewComponent';
import { windowHeight, windowWidth } from '../../utils/Dimensions';
import HeaderTitle from '../../components/common/HeaderTitle';

const AudioBooksScreen = () => {
  return (
    <SafeAreaViewComponent>
      <HeaderTitle headerTitle={'AudioBooks'} />
      <View style={styles.comingSoon}>
        <Image
          source={require('../../assets/comingSoon.jpg')}
          style={styles.comingSoonImage}
        />
      </View>
    </SafeAreaViewComponent>
  );
};

export default AudioBooksScreen;

const styles = StyleSheet.create({
  comingSoon: {
    justifyContent: 'center',
    // backgroundColor: 'red',
    alignContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    flex: 1,
  },
  comingSoonImage: {
    height: windowHeight / 2,
    width: windowWidth / 1.1,
    resizeMode: 'contain',
  },
});
