import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import { windowHeight, windowWidth } from '../../utils/Dimensions';
import { useTheme } from '../../Context/ThemeContext';
import { COLORS } from '../../themes/themes';
import { capitalizeFirstLetter, formatToNaira } from '../../Library/Common';
import {
  removeBookFromWishlist,
  saveWishlistBooks,
} from '../../redux/features/books/booksSlice';

const BookCardWithPriceTag = ({ onPress, props }) => {
  const { theme, isDarkMode } = useTheme();
  const [isImageLoading, setIsImageLoading] = useState(true);

  const dispatch = useDispatch();
  const state = useSelector(state => state);

  const reduxWishlistBooks = state?.books?.wishlistsBooks || [];
  const isBookAddedToWishlist = reduxWishlistBooks?.some(
    book => book?._id === props?._id,
  );
  // console.log('reduxWishlistBooks', reduxWishlistBooks);

  const addToWishlist = () => {
    console.log('Book wishlisted:', props);
    if (isBookAddedToWishlist) {
      // If the book is already in wishlist, remove it from wishlist
      dispatch(removeBookFromWishlist(props));
    } else {
      // If the book is not in wishlist, add it to wishlist
      dispatch(saveWishlistBooks(props));
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.BookCardContainer, { borderColor: theme?.borderColor }]}
      key={props?._id}
    >
      {isImageLoading && (
        <SkeletonPlaceholder
          backgroundColor={isDarkMode ? '#2a2a2a' : '#e1e9ee'}
          highlightColor={isDarkMode ? '#3a3a3a' : '#f2f8fc'}
          speed={1200}
        >
          <View style={styles.bookImage} />
        </SkeletonPlaceholder>
      )}
      <Image
        source={{
          uri: props?.bookImage,
        }}
        style={[styles.bookImage, isImageLoading && { position: 'absolute' }]}
        onLoadStart={() => setIsImageLoading(true)}
        onLoadEnd={() => setIsImageLoading(false)}
        onError={() => setIsImageLoading(false)}
      />
      {props?.isActive && !props?.isInLibrary ? (
        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.priceButton,
            {
              backgroundColor: COLORS?.legacyBridgePrimary,
            },
          ]}
          onPress={onPress}
        >
          <Text style={[styles.priceTag, { color: COLORS?.black }]}>
            {formatToNaira(props?.price)}
          </Text>
        </TouchableOpacity>
      ) : props?.isInLibrary ? (
        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.ribbon,
            {
              backgroundColor: COLORS?.legacyBridgeBlue,
            },
          ]}
          onPress={onPress}
        >
          <Text style={[styles.ribbonText, { color: 'white' }]}>Read Now</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.ribbon}
          onPress={onPress}
        >
          <Text style={styles.ribbonText}>Coming Soon</Text>
        </TouchableOpacity>
      )}

      <View style={styles.bookInfoContainer}>
        <Text
          numberOfLines={1}
          style={[styles.bookTitle, { color: theme?.text }]}
        >
          {props?.bookTitle}
        </Text>
        <Text style={[styles.bookAuthor, { color: theme?.text }]}>
          By: {props?.author}
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 5,
        }}
      >
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
            {capitalizeFirstLetter(props?.bookFormat)}
          </Text>
        </View>
        <TouchableOpacity activeOpacity={0.9} onPress={addToWishlist}>
          <Ionicons
            name={isBookAddedToWishlist ? 'heart' : 'heart-outline'}
            size={18}
            color={COLORS.legacyBridgePrimary}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default BookCardWithPriceTag;

const styles = StyleSheet.create({
  BookCardContainer: {
    width: windowWidth / 2.2,
    // height: windowHeight / 3.5,
    borderRadius: 5,
    // backgroundColor: 'red',
    margin: 3,
    marginBottom: 5,
    borderWidth: 1,
    padding: 5,
    overflow: 'hidden',
  },
  bookImage: {
    width: windowWidth / 2.35,
    height: windowHeight / 4,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    // resizeMode: 'contain',
    borderRadius: 5,
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
  priceButton: {
    backgroundColor: COLORS.legacyBridgePrimary,
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    // width: '80%',
    // marginTop: 10,
    zIndex: 999,
    position: 'absolute',
    right: 1,
  },
  priceTag: { color: 'black', fontSize: 12, fontWeight: '700' },
  ribbon: {
    position: 'absolute',
    top: 15,
    right: -40, // pushes it outside so rotation looks clean
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 35,
    transform: [{ rotate: '40deg' }],
    zIndex: 999,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },

  ribbonText: {
    color: 'black',
    fontWeight: '700',
    fontSize: 12,
  },
});
