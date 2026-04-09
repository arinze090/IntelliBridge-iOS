import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { COLORS } from '../../themes/themes';

const StatusCard = ({ status }) => {
  return (
    <View
      style={[
        styles.statusCard,
        {
          backgroundColor: status == 'completed' ? 'green' : 'red',
        },
      ]}
    >
      <Text
        style={[
          styles.statusCardText,
          {
            color: status == 'completed' ? 'white' : COLORS.declinedBgColor,
          },
        ]}
      >
        {status == 'completed' ? 'Completed' : 'Failed'}
      </Text>
    </View>
  );
};

export default StatusCard;

const styles = StyleSheet.create({
  statusCard: {
    borderRadius: 15,
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'green',
    padding: 10,
  },
  statusCardText: {
    fontSize: 10,
    fontWeight: '500',
    color: 'white',
  },
});
