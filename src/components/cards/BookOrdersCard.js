import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useTheme } from '../../Context/ThemeContext';
import { windowHeight, windowWidth } from '../../utils/Dimensions';
import {
  capitalizeFirstLetter,
  formatDateTime,
  formatToNaira,
} from '../../Library/Common';
import { COLORS } from '../../themes/themes';
import StatusCard from '../cards/StatusCard';

const BookOrdersCard = ({ onPress, props }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.bookOrdersCard, { borderBottomColor: theme?.borderColor }]}
    >
      <View style={styles.bookOrder}>
        <View style={{ flexDirection: 'row' }}>
          <Image
            source={{ uri: props?.items?.[0]?.bookImage }}
            style={styles.bookOrderImage}
          />
          <View style={{ justifyContent: 'space-between', marginLeft: 10 }}>
            <View>
              <Text
                numberOfLines={1}
                style={[styles.bookTitle, { color: theme?.text }]}
              >
                {props?.items?.[0]?.title}
              </Text>
              <Text style={[styles.bookAuthor, { color: theme?.text }]}>
                By: {props?.items?.[0]?.author}
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons
                name="book-outline"
                size={18}
                color={COLORS.legacyBridgePrimary}
              />
              <Text style={{ color: theme?.text, fontSize: 12, marginLeft: 5 }}>
                {capitalizeFirstLetter(props?.items?.[0]?.bookFormat)}
              </Text>
            </View>
          </View>
        </View>
        <Text style={[styles.bookTitle, { color: theme?.text }]}>
          {formatToNaira(props?.items?.[0]?.price)}
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={[{ color: theme?.text }]}>
          {formatDateTime(props?.createdAt)}
        </Text>
        <StatusCard status={'completed'} />
      </View>
    </TouchableOpacity>
  );
};

export default BookOrdersCard;

const styles = StyleSheet.create({
  bookOrdersCard: {
    // backgroundColor: 'red',
    // flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    padding: 10,
  },
  bookOrder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  bookOrderImage: {
    width: windowWidth / 5,
    height: windowHeight / 10,
    borderRadius: 5,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  bookAuthor: {
    fontSize: 14,
    fontWeight: '400',
  },
});
