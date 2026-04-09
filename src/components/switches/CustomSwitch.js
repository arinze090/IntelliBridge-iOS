import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { windowHeight, windowWidth } from '../../utils/Dimensions';
import { COLORS } from '../../themes/themes';

const CustomSwitch = ({ arrayData, seletionMode, onSelectSwitch }) => {
  const [getSelectionMode, setSelectionMode] = useState(seletionMode);

  const updateSwitchData = value => {
    setSelectionMode(value);
    onSelectSwitch(value);
  };
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.customSwitch}
    >
      {arrayData?.map((cur, i) => (
        <TouchableOpacity
          key={i}
          style={{
            backgroundColor:
              getSelectionMode == i ? COLORS.pinky : COLORS.white,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            // padding: 10,
            width: windowWidth / 4,
            borderWidth: 1,
            borderColor:
              getSelectionMode == i ? COLORS.white : COLORS.ndonuGrey,
            marginRight: 10,
            height: windowHeight / 26,
          }}
          activeOpacity={1}
          onPress={() => updateSwitchData(i)}
        >
          <Text
            style={[
              styles.switchText,
              { color: getSelectionMode == i ? COLORS.white : COLORS.black },
            ]}
          >
            {cur?.optionTitle}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default CustomSwitch;

const styles = StyleSheet.create({
  customSwitch: {
    // backgroundColor: 'red',
    flexDirection: 'row',
    marginLeft: 10,
  },
});
