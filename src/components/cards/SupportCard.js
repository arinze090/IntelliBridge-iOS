import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { COLORS } from '../../themes/themes';

const SupportCard = ({ props, onPress, iconName }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.statusCard]}
    >
      <Ionicons name={iconName} color={'#292D32'} size={18} />
      <Text style={[styles.statusCardText]}>{props}</Text>
    </TouchableOpacity>
  );
};

export default SupportCard;

const styles = StyleSheet.create({
  statusCard: {
    borderRadius: 15,
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.legacyBridgePrimary,
    padding: 10,
    alignSelf: 'flex-start',
    marginRight: 10,
    flexDirection: 'row',
    marginBottom: 10,
  },
  statusCardText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'black',
    marginLeft: 4,
  },
});
