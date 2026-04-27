import { Platform, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Slider from '@react-native-community/slider';

import { windowHeight, windowWidth } from '../../../utils/Dimensions';

const PaginationSlider = ({ currentPage, totalPages, onSlidingComplete }) => {
  return (
    <View style={styles.sliderArea}>
      <Text style={styles.fontBtnSm}>{currentPage}</Text>
      <Slider
        style={{ width: windowWidth / 1.3, height: 40 }}
        minimumValue={0}
        maximumValue={totalPages || 1}
        step={1}
        value={currentPage}
        onSlidingComplete={onSlidingComplete}
      />
      <Text style={styles.fontBtnSm}>{totalPages}</Text>
    </View>
  );
};

export default PaginationSlider;

const styles = StyleSheet.create({
  sliderArea: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    width: windowWidth / 1.1,
    // backgroundColor: 'red',
    //   margin: 10,
    padding: 4,
    alignSelf: 'center',
  },
  fontBtnSm: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
});
