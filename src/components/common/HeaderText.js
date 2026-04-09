import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { COLORS } from '../../themes/themes';
import { useTheme } from '../../Context/ThemeContext';

const HeaderText = ({ headerTitle }) => {
  const { theme } = useTheme();

  return (
    <View style={{ padding: 20 }}>
      <Text
        style={{
          color: theme.text,
          fontSize: 18,
          fontWeight: '600',
          lineHeight: 24,
          textAlign: 'center',
        }}
      >
        {headerTitle}
      </Text>
    </View>
  );
};

export default HeaderText;

const styles = StyleSheet.create({});
