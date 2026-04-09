import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { windowHeight, windowWidth } from '../../utils/Dimensions';
import { useTheme } from '../../Context/ThemeContext';
import { COLORS } from '../../themes/themes';

const BookCard = ({ onPress, props }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.BookCardContainer}
    >
      <Image
        source={{
          uri: props?.bookImage,
        }}
        style={styles.bookImage}
      />
      <View style={styles.bookInfoContainer}>
        <Text
          numberOfLines={1}
          style={[styles.bookTitle, { color: theme?.text }]}
        >
          {props?.bookTitle}
        </Text>
        <Text style={[styles.bookAuthor, { color: theme?.secondaryText }]}>
          By: {props?.author}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default BookCard;

const styles = StyleSheet.create({
  BookCardContainer: {
    width: windowWidth / 2.2,
    height: windowHeight / 3.5,
    borderRadius: 5,
    // backgroundColor: 'red',
    margin: 3,
    marginBottom: 10,
  },
  bookImage: {
    width: windowWidth / 2.2,
    height: windowHeight / 4.5,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    // resizeMode: 'contain',
    // borderRadius: 5,
  },
  bookInfoContainer: {
    // backgroundColor: 'green',
    marginTop: 5,
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
