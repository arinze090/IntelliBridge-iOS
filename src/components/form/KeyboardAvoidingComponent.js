import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import React from 'react';
import { COLORS } from '../../themes/themes';
import { useTheme } from '../../Context/ThemeContext';

const KeyboardAvoidingComponent = ({ children }) => {
  const { theme } = useTheme();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme?.background }]}
    >
      {children}
    </KeyboardAvoidingView>
  );
};

export default KeyboardAvoidingComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.appBackground,
  },
});
