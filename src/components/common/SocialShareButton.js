import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { windowHeight, windowWidth } from '../../utils/Dimensions';
import { useTheme } from '../../Context/ThemeContext';

const SocialShareButton = ({ onPress, name, color, title }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.btn, { borderColor: theme?.borderColor }]}
      onPress={onPress}
    >
      <Ionicons name={name} color={color} size={30} />
    </TouchableOpacity>
  );
};

export default SocialShareButton;

const styles = StyleSheet.create({
  btn: {
    width: windowWidth / 5.6,
    height: windowHeight / 12,
    borderRadius: 10,
    // alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    margin: 10,
    alignItems: 'center',
  },
  btnText: {
    alignSelf: 'center',
    color: 'black',
    fontSize: 16,
    fontWeight: '700',
    alignContent: 'center',
  },
  title: {
    alignSelf: 'center',
    color: 'black',
    fontSize: 14,
    fontWeight: '700',
    alignContent: 'center',
  },
});
