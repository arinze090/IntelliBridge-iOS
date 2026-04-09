import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { COLORS } from '../../themes/themes';

const CategoryCard = ({ props, iconName }) => {
  return (
    <View style={[styles.statusCard]}>
      <Ionicons name={iconName} color={'#292D32'} size={12} />
      <Text style={[styles.statusCardText]}>{props}</Text>
    </View>
  );
};

export default CategoryCard;

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
  },
  statusCardText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'black',
    marginLeft: 4,
  },
});
