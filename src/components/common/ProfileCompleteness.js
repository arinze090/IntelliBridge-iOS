import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { COLORS } from '../../themes/themes';
import TransparentBtn from '../form/TransparentBtn';
import { useNavigation } from '@react-navigation/native';

const ProfileCompleteness = () => {
  const navigation = useNavigation();

  return (
    <View
      style={{
        backgroundColor: COLORS.pinky,
        borderRadius: 8,
        padding: 20,
      }}
    >
      <Text style={{ color: 'white', fontWeight: '700', marginBottom: 8 }}>
        Complete Your Profile
      </Text>
      <Text style={{ color: 'white' }}>
        You need to complete your profile to access all features.
      </Text>
      <TransparentBtn
        title={'Complete Your Profile'}
        onPress={() => {
          navigation.navigate('ProfileInfo');
        }}
      />
    </View>
  );
};

export default ProfileCompleteness;

const styles = StyleSheet.create({});
