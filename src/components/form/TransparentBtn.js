import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { windowHeight, windowWidth } from '../../utils/Dimensions';
import { COLORS } from '../../themes/themes';
import { useTheme } from '../../Context/ThemeContext';

const TransparentBtn = ({
  loading,
  title,
  onPress,
  disabled,
  width = false,
  marginTop,
  marginBottom,
  leftIcon,
  iconColor,
  height,
  formError,
}) => {
  const { theme } = useTheme();

  return (
    <View style={{ marginTop: 20 }}>
      {formError && <Text style={styles.error}>{formError}</Text>}
      <TouchableOpacity
        activeOpacity={0.9}
        style={[
          disabled ? styles.disabledBtn : styles.btn,
          {
            width: windowWidth / (width || 1.2),
            marginTop: marginTop,
            marginBottom: marginBottom,
            height: height ? height : 60,
          },
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        {leftIcon ? (
          <Ionicons
            name={leftIcon}
            size={20}
            color={theme?.text}
            style={styles.leftIcon}
          />
        ) : null}

        {loading ? (
          <ActivityIndicator size={20} color={'white'} />
        ) : (
          <Text style={[styles.buttonText]}>{title}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default TransparentBtn;

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    fontSize: 15,
    textAlign: 'center',
    margin: 10,
    color: '#000',
    fontWeight: '600',
    zIndex: 1000,
  },
  btn: {
    height: windowHeight / 17,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: COLORS.legacyBridgePrimary,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    // marginBottom: 20,
    // marginTop: 5,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
  },
  btnText: {
    alignSelf: 'center',
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    alignContent: 'center',
  },
  disabledBtn: {
    height: windowHeight / 17,
    borderRadius: 8,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.legacyBridgePrimary,
    justifyContent: 'center',
    alignContent: 'center',
    // marginBottom: 20,
    opacity: 0.25,
  },
  leftIcon: {
    marginRight: 10,
  },
  error: {
    color: 'red',
    fontWeight: '500',
    alignSelf: 'center',
    marginBottom: 7,
    fontSize: 13,
  },
});
