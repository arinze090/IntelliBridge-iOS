import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useTheme } from '../../Context/ThemeContext';

const PaymentButtons = ({ onPress, paymentMethod, paymentMethodIcon }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={{
        padding: 15,
        backgroundColor: theme?.text,
        borderRadius: 8,
        marginBottom: 10,
        flexDirection: 'row',
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onPress={onPress}
    >
      <Text
        style={{
          color: theme?.background,
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: 16,
        }}
      >
        Buy with
      </Text>
      <Ionicons
        name={paymentMethodIcon}
        size={20}
        color={theme?.background}
        style={{ marginRight: 5, marginLeft: 10 }}
      />
      <Text
        style={{
          color: theme?.background,
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: 16,
        }}
      >
        {paymentMethod}
      </Text>
    </TouchableOpacity>
  );
};

export default PaymentButtons;

const styles = StyleSheet.create({});
