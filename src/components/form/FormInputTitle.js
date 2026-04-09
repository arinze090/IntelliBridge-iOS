import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { useTheme } from '../../Context/ThemeContext';

const FormInputTitle = ({ formTitle }) => {
  const { theme } = useTheme();

  return (
    <Text style={[styles.inputTitle, { color: theme?.text }]}>{formTitle}</Text>
  );
};

export default FormInputTitle;

const styles = StyleSheet.create({
  inputTitle: {
    marginBottom: 10,
    fontSize: 16,
    color: '#1E1E1E',
    fontWeight: '600',
  },
});
