import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';

import { windowHeight, windowWidth } from '../../utils/Dimensions';
import { useTheme } from '../../Context/ThemeContext';
import { COLORS } from '../../themes/themes';
import ProgressBar from '../common/ProgressBar';
import { formatToNaira } from '../../Library/Common';

const ReadingBookCard = ({ onPress, props, bookProgress }) => {
  // console.log('popppps:', props, bookProgress);
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.BookCardContainer, { borderColor: theme?.borderColor }]}
    >
      <Image
        source={{
          uri: props?.bookImage,
        }}
        style={styles.bookImage}
      />
      <View style={styles.bookInfoContainer}>
        <View>
          <Text style={[styles.bookTitle, { color: theme?.text }]}>
            {props?.bookTitle}
          </Text>
          <Text style={{ color: theme?.secondaryText, fontSize: 14 }}>
            By:{' '}
            <Text
              style={{
                color: theme?.secondaryText,
                fontSize: 15,
                fontWeight: '600',
              }}
            >
              {props?.author}
            </Text>
          </Text>
        </View>

        {bookProgress ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ color: theme?.text, fontSize: 12 }}>
              {bookProgress || 0}%
            </Text>
            <ProgressBar progress={bookProgress || 0} />
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            style={styles.priceButton}
          >
            <Text style={{ color: 'black', fontSize: 14, fontWeight: '700' }}>
              Start Reading
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ReadingBookCard;

const styles = StyleSheet.create({
  BookCardContainer: {
    width: windowWidth / 1.05,
    height: windowHeight / 5,
    borderRadius: 5,
    // backgroundColor: 'red',
    marginBottom: 4,
    margin: 3,
    flexDirection: 'row',
    // justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: COLORS.appGrey5,
  },
  bookImage: {
    width: windowWidth / 2.8,
    height: windowHeight / 5.5,
    borderRadius: 5,
  },
  bookInfoContainer: {
    // backgroundColor: 'green',
    marginLeft: 10,
    padding: 10,
    width: windowWidth / 1.8,
    justifyContent: 'space-between',
    height: windowHeight / 5.5,
    paddingBottom: 0,
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 5,
  },
  priceButton: {
    backgroundColor: COLORS.legacyBridgePrimary,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    // marginTop: 10,
  },
});
