import { StyleSheet, Text, View, Image } from 'react-native';
import React from 'react';
import { windowHeight, windowWidth } from '../../utils/Dimensions';

const ComingSoon = () => {
  return (
    <Image
      source={require('../../assets/comingSoon.jpg')}
      style={{
        width: windowWidth,
        height: windowHeight / 1.5,
        objectFit: 'contain',
        justifyContent: 'center',
        alignContent: 'center',
      }}
    />
  );
};

export default ComingSoon;

const styles = StyleSheet.create({
  comingSoon: {
    justifyContent: 'center',
    alignContent: 'center',
    height: windowHeight / 2,
    alignItems: 'center',
    alignSelf: 'center',
    // backgroundColor: "red",
    flex: 1,
  },
});
