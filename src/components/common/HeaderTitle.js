import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';

import ProgressBar from './ProgressBar';
import { useTheme } from '../../Context/ThemeContext';

const HeaderTitle = ({
  onLeftIconPress,
  leftIcon,
  headerTitle,
  onRightIconPress,
  rightIcon,
  progress,
}) => {
  const state = useSelector(state => state);
  const userDestination = state.user.destination;
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {leftIcon && (
        <TouchableOpacity
          onPress={onLeftIconPress}
          activeOpacity={0.9}
          style={styles.leftIconContainer}
        >
          <Ionicons
            name={leftIcon ? leftIcon : 'chevron-back-outline'}
            size={30}
            color={theme?.text}
          />
        </TouchableOpacity>
      )}
      {headerTitle && (
        <Text style={[styles.headerTitle, { color: theme?.text }]}>
          {headerTitle}
        </Text>
      )}
      {userDestination == 'Registration' && progress && (
        <ProgressBar progress={progress} />
      )}

      {rightIcon ? (
        <TouchableOpacity activeOpacity={0.9} onPress={onRightIconPress}>
          <Ionicons name={rightIcon} size={24} color={theme?.text} />
        </TouchableOpacity>
      ) : (
        <View />
      )}
    </View>
  );
};

export default HeaderTitle;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-between',
    alignContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    color: 'black',
    fontWeight: '700',
  },
  leftIconContainer: {
    // backgroundColor: 'red',
    borderRadius: 10,
    padding: 5,
  },
});
