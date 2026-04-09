import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../Context/ThemeContext';

const ProfileOptionsDisplay = ({ onPress, iconName, title }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.set, { borderBottomColor: theme?.borderColor }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.setsContent}>
        <Ionicons name={iconName} size={20} color={'#292D32'} />
        <Text style={[styles.settingsText, { color: theme?.text }]}>
          {title}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward-outline"
        size={20}
        color={'#333'}
        style={{ marginTop: 5 }}
      />
    </TouchableOpacity>
  );
};

export default ProfileOptionsDisplay;

const styles = StyleSheet.create({
  settings: {
    margin: 5,
    marginTop: 30,
    borderTopWidth: 1,
    marginBottom: 20,
    borderColor: '#999',
  },
  set: {
    marginBottom: 0,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    // backgroundColor: 'pink',
  },
  setsContent: {
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    margin: 5,
    marginTop: 10,
  },
  settingsText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
    marginLeft: 17,
  },
});
